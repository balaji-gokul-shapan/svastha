import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useAppDispatch } from "@/lib/hooks";
import { getCamp } from "@/lib/features/getCampSlice";
import { getStudentByCamp } from "@/lib/features/getStudentbyCampSlice";
import useAuthUser from "@/lib/useAuthUser";

const useStudentData = (selectedCampId = "") => {
  const dispatch = useAppDispatch();
  // Auth user via react-query (fresh from /api/auth/me, with a session
  // fallback). NOTE: it resolves asynchronously — authUser is null for the
  // first render(s) until the query settles.
  const { authUser, isLoading: authUserLoading } = useAuthUser();
  console.log(authUser, "authUser in useStudentData");
  const checkDoctor = authUser?.account_type === "doctor" || authUser?.account_type === "admin";
  const checkSchool = authUser?.account_type === "school";
  console.log({ checkDoctor, checkSchool });


  const {
    data: campsData = [],
    isLoading: campsLoading,
    error: campsQueryError,
  } = useQuery({
    queryKey: ["doctor-camps"],
    queryFn: () => dispatch(getCamp()).unwrap(),
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const {
    data: studentCampData = [],
    isLoading: studentCampLoading,
    error: studentCampQueryError,
  } = useQuery({
    queryKey: ["student-healthcamp", selectedCampId],
    enabled: Boolean(selectedCampId),
    queryFn: () => dispatch(getStudentByCamp({ campId: selectedCampId })).unwrap(),
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const studentCampRows = useMemo(() => {
    if (Array.isArray(studentCampData)) {
      return studentCampData;
    }

    if (Array.isArray(studentCampData?.data)) {
      return studentCampData.data;
    }

    if (studentCampData && typeof studentCampData === "object") {
      return [studentCampData];
    }

    return [];
  }, [studentCampData]);

  const filteredCampRows = useMemo(() => {
    if (!selectedCampId || !studentCampRows.length) {
      return [];
    }

    const selectedCampMeta = Array.isArray(campsData)
      ? campsData.find(
        (camp) => String(camp?.id ?? camp?.campId ?? camp?.camp_id ?? "") === String(selectedCampId),
      )
      : null;

    const selectedSchoolId = String(
      selectedCampMeta?.school_id ?? selectedCampMeta?.schoolId ?? selectedCampMeta?.school ?? "",
    ).trim();
    const selectedDoctorId = String(
      selectedCampMeta?.doctor_id ?? selectedCampMeta?.doctorId ?? selectedCampMeta?.doctor ?? "",
    ).trim();
    const selectedCampDate = String(
      selectedCampMeta?.camp_date ?? selectedCampMeta?.campDate ?? "",
    ).trim();

    return studentCampRows.filter((row) => {
      const rowCamp = row?.camp && typeof row.camp === "object" ? row.camp : row;
      const rowCampId = String(rowCamp?.id ?? rowCamp?.camp_id ?? rowCamp?.campId ?? row?.id ?? "").trim();
      const rowSchoolId = String(rowCamp?.school_id ?? rowCamp?.schoolId ?? rowCamp?.school ?? "").trim();
      const rowDoctorId = String(rowCamp?.doctor_id ?? rowCamp?.doctorId ?? rowCamp?.doctor ?? "").trim();
      const rowCampDate = String(rowCamp?.camp_date ?? rowCamp?.campDate ?? "").trim();

      const idMatch = rowCampId && rowCampId === String(selectedCampId).trim();
      if (idMatch) {
        return true;
      }

      const schoolDoctorMatch =
        selectedSchoolId &&
        selectedDoctorId &&
        rowSchoolId === selectedSchoolId &&
        rowDoctorId === selectedDoctorId;
      const dateMatch = !selectedCampDate || !rowCampDate || rowCampDate === selectedCampDate;

      if (schoolDoctorMatch && dateMatch) {
        return true;
      }

      // Keep row when API already pre-filters by camp and metadata is missing at row level.
      if (!rowCampId && !rowSchoolId && !rowDoctorId) {
        return true;
      }

      return false;
    });
  }, [campsData, selectedCampId, studentCampRows]);


  return {
    authUser,
    authUserLoading,
    checkDoctor,
    checkSchool,
    campsData,
    campsLoading,
    campsQueryError,
    studentCampRows,
    filteredCampRows,
    studentCampLoading,
    studentCampQueryError,
  };
};

export default useStudentData;
