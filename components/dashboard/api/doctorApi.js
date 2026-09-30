import {
  getAssignEvent,
  getStudentByEvent,
} from "@/lib/features/getEventAssignSlice";
import { filterGeneralScreening } from "@/lib/features/getInitialScreening";
import { getHearingScreening } from "@/lib/features/getHearingScreening";
import { filterDentalScreening } from "@/lib/features/getDentalScreening";
import { getVisionScreening } from "@/lib/features/getVisionScreening";
import { useAppDispatch } from "@/lib/hooks";
import { useAuthRole } from "@/lib/user-role";
import { useQuery } from "@tanstack/react-query";
import {
  getCampDoctorIds,
  getCampId,
  getCampPrimaryDoctorId,
} from "@/lib/camp-utils";
import { normalizeEvents } from "@/lib/dashboard-stats";
import { useAllScreeningReport } from "@/components/healthChecks/getScreeningReport";

export const useDoctorApi = (
  role,
  selectedDoctorId = "all",
  selectedCampId = "all",
) => {
  const dispatch = useAppDispatch();
  const authRole = useAuthRole();
  const getRole = role ?? authRole;

  const {
    data: assignedEvents,
    isLoading: assignEventLoading,
    error: assignEventError,
  } = useQuery({
    queryKey: ["get-event", getRole],
    queryFn: () => dispatch(getAssignEvent()).unwrap(),
    enabled: getRole === "doctor",
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  const normalizedDoctorId = String(selectedDoctorId ?? "all").trim();
  const normalizedCampId = String(selectedCampId ?? "all").trim();
  const doctorEvents = normalizeEvents(assignedEvents).filter((event) => {
    const eventCampId = getCampId(event);
    const matchesCamp =
      normalizedCampId === "all" || eventCampId === normalizedCampId;
    const matchesDoctor =
      normalizedDoctorId === "all" ||
      getCampDoctorIds(event).includes(normalizedDoctorId) ||
      getCampPrimaryDoctorId(event) === normalizedDoctorId;

    return matchesCamp && matchesDoctor && Boolean(eventCampId);
  });
  const doctorEventIds = doctorEvents.map(getCampId).filter(Boolean);

  const getStudentGender = (student) => {
    const value =
      student?.gender ??
      student?.Gender ??
      student?.sex ??
      student?.Sex ??
      student?.gender_name ??
      student?.sex_name ??
      student?.genderName ??
      student?.sexName ??
      "";

    const normalized = String(value).trim().toLowerCase();
    if (["male", "m", "boy", "boys", "1"].includes(normalized)) return "male";
    if (["female", "f", "girl", "girls", "2"].includes(normalized))
      return "female";
    return "other";
  };

  const getStudentAge = (student) => {
    const dateOfBirth =
      student?.dob ??
      student?.DOB ??
      student?.date_of_birth ??
      student?.dateOfBirth ??
      student?.student_dob ??
      student?.profile?.dob ??
      student?.profile?.date_of_birth;

    if (dateOfBirth) {
      const birthDate = new Date(dateOfBirth);
      const today = new Date();

      if (!Number.isNaN(birthDate.getTime()) && birthDate <= today) {
        let age = today.getUTCFullYear() - birthDate.getUTCFullYear();
        const monthDifference = today.getUTCMonth() - birthDate.getUTCMonth();

        if (
          monthDifference < 0 ||
          (monthDifference === 0 && today.getUTCDate() < birthDate.getUTCDate())
        ) {
          age -= 1;
        }

        return age >= 0 ? age : null;
      }
    }

    const ageValue =
      student?.age ??
      student?.Age ??
      student?.student_age ??
      student?.studentAge ??
      student?.profile?.age;
    const age = Number(ageValue);

    return Number.isFinite(age) && age >= 0 ? Math.floor(age) : null;
  };

  const getAgeGroup = (age) => {
    if (age === null) return "unknown";
    if (age <= 5) return "0-5";
    if (age <= 10) return "6-10";
    if (age <= 15) return "11-15";
    if (age <= 18) return "16-18";
    return "19+";
  };

  const getAgeData = (items) => {
    const groups = {
      "0-5": 0,
      "6-10": 0,
      "11-15": 0,
      "16-18": 0,
      "19+": 0,
      unknown: 0,
    };
    const byAge = Object.fromEntries(
      Object.keys(groups).map((group) => [group, []]),
    );
    let totalAge = 0;
    let knownAgeCount = 0;

    items.forEach((student) => {
      const age = getStudentAge(student);
      const group = getAgeGroup(age);
      groups[group] += 1;
      byAge[group].push(student);

      if (age !== null) {
        totalAge += age;
        knownAgeCount += 1;
      }
    });

    return {
      ageGroups: groups,
      byAge,
      averageAge: knownAgeCount ? totalAge / knownAgeCount : 0,
    };
  };

  const getGenderData = (items) =>
    items.reduce(
      (result, student) => {
        const gender = getStudentGender(student);
        result[gender] += 1;
        result.byGender[gender].push(student);
        return result;
      },
      {
        male: 0,
        female: 0,
        other: 0,
        byGender: { male: [], female: [], other: [] },
      },
    );

  const {
    data: studentsByEvent,
    isLoading: getStudentByEventLoading,
    error: getStudentByEventError,
  } = useQuery({
    queryKey: [
      "get-students-by-doctor",
      normalizedDoctorId,
      normalizedCampId,
      doctorEventIds,
    ],
    queryFn: async () => {
      const fetchAllStudents = async (eventId) => {
        const firstPage = await dispatch(
          getStudentByEvent({ eventId, page: 1, perPage: 1000 }),
        ).unwrap();
        const firstItems = Array.isArray(firstPage?.items)
          ? firstPage.items
          : [];
        const total = Number(firstPage?.total) || firstItems.length;
        const pageCount = Math.ceil(total / 1000);
        const remainingPages =
          pageCount > 1
            ? await Promise.all(
                Array.from({ length: pageCount - 1 }, (_, index) =>
                  dispatch(
                    getStudentByEvent({
                      eventId,
                      page: index + 2,
                      perPage: 1000,
                    }),
                  ).unwrap(),
                ),
              )
            : [];

        return {
          items: [
            ...firstItems,
            ...remainingPages.flatMap((page) =>
              Array.isArray(page?.items) ? page.items : [],
            ),
          ],
          total,
        };
      };

      const responses = await Promise.all(
        doctorEventIds.map((eventId) => fetchAllStudents(eventId)),
      );
      const items = responses.flatMap((response) => response.items);
      const genderData = getGenderData(items);
      const ageData = getAgeData(items);

      return {
        ...genderData,
        ...ageData,
        items,
        total: responses.reduce(
          (sum, response) => sum + (Number(response.total) || 0),
          0,
        ),
      };
    },
    enabled:
      Boolean(getRole) &&
      getRole !== "school_sub_account" &&
      doctorEventIds.length > 0,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  const selectedCamp = normalizedCampId !== "all" && normalizedCampId;
  const campStudents = Array.isArray(studentsByEvent?.items)
    ? studentsByEvent.items
    : [];
  const studentIds = [
    ...new Set(
      campStudents
        .map((student) =>
          String(
            student?.id ??
              student?.studentId ??
              student?.student_id ??
              student?.cus_id ??
              student?.cusId ??
              student?.school_registration_number ??
              student?.admission_number ??
              student?.registration_number ??
              "",
          ).trim(),
        )
        .filter(Boolean),
    ),
  ];

  const {
    campScreeningRecords,
    campVisionScreeningRecords,
    campDentalScreeningRecords,
    campHearingScreeningRecords,
    campEntScreeningRecords,
    isLoading: screeningLoading,
    error: screeningError,
  } = useAllScreeningReport({
    campId: selectedCamp ? selectedCamp : "",
  });

  const screeningRecords = {
    generalScreeningRecord: campScreeningRecords ?? [],
    dentalScreeningRecord: campDentalScreeningRecords ?? [],
    hearingScreeningRecord: campHearingScreeningRecords ?? [],
    visionScreeningRecord: campVisionScreeningRecords ?? [],
    entScreeningRecord: campEntScreeningRecords ?? [],
  };


  const students = Array.isArray(studentsByEvent?.items)
    ? studentsByEvent.items
    : [];
  const totalStudents = Number(studentsByEvent?.total) || students.length;
  const maleStudents = Number(studentsByEvent?.male) || 0;
  const femaleStudents = Number(studentsByEvent?.female) || 0;
  const otherStudents = Number(studentsByEvent?.other) || 0;
  const ageGroups = studentsByEvent?.ageGroups ?? {};
  const averageAge = Number(studentsByEvent?.averageAge) || 0;

  return {
    assignedEvents,
    assignEventLoading,
    assignEventError,
    studentsByEvent,
    students,
    totalStudents,
    maleStudents,
    femaleStudents,
    otherStudents,
    ageGroups,
    averageAge,
    byAge: studentsByEvent?.byAge ?? {},
    generalScreeningRecord: screeningRecords.generalScreeningRecord,
    hearingScreeningRecord: screeningRecords.hearingScreeningRecord,
    dentalScreeningRecord: screeningRecords.dentalScreeningRecord,
    visionScreeningRecord: screeningRecords.visionScreeningRecord,
    screeningLoading,
    screeningError,
    maleStudentRecords: studentsByEvent?.byGender?.male ?? [],
    femaleStudentRecords: studentsByEvent?.byGender?.female ?? [],
    otherStudentRecords: studentsByEvent?.byGender?.other ?? [],
    getStudentByEventLoading,
    getStudentByEventError,
  };
};
