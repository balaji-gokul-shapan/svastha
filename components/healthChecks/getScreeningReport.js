"use client";

import { useCallback, useMemo, useState } from "react";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { useAppDispatch } from "@/lib/hooks";

import { getAllScreeningRecord } from "@/lib/features/registerGeneralScreening";

import { getAllVisionScreeningReport } from "@/lib/features/registerVisionScreening";
import { getVisionScreening } from "@/lib/features/getVisionScreening";

import { getAllDentalScreeningReports } from "@/lib/features/registerDentalScreening";
import { getDentalScreening } from "@/lib/features/getDentalScreening";

import {
  getAllHearingScreeningReport,
} from "@/lib/features/registerHearingScreening";
import { getHearingScreening } from "@/lib/features/getHearingScreening";

import { getAllEntScreeningReport } from "@/lib/features/registerEntScreening";
import { getEntScreening } from "@/lib/features/getEntScreening";


export const DEFAULT_SCREENING_PAGE_SIZE = 10;


const DEFAULT_SCREENING_PAGES = {
  general: 1,
  vision: 1,
  dental: 1,
  hearing: 1,
  ent: 1,
};

const getScreeningPagination = (payload, { page, pageSize }) => {
  let meta = payload ?? {};

  if (Array.isArray(meta)) {
    meta = {};
  } else {

    while (
      meta &&
      typeof meta === "object" &&
      !Array.isArray(meta) &&
      meta.current_page === undefined &&
      meta.data !== undefined
    ) {
      meta = meta.data;

      if (Array.isArray(meta)) {
        meta = {};
        break;
      }
    }
  }

  const currentPage = Math.max(1, Number(meta?.current_page) || Number(page) || 1);
  const lastPage = Math.max(1, Number(meta?.last_page) || 1);
  const total = Math.max(0, Number(meta?.total) || 0);
  const perPage = Number(meta?.per_page) || Number(pageSize) || 0;

  return {
    page: currentPage,
    pageSize: perPage,
    totalRows: total,
    totalPages: lastPage,
    hasNext: currentPage < lastPage,
    hasPrev: currentPage > 1,
  };
};

export const useAllScreeningReport = (options = {}) => {

  const {
    getId = "",
    campId = "",

    classFilter = "",
    sectionFilter = "",
  } = options ?? {};
  const dispatch = useAppDispatch();

  const studentId = String(getId ?? "").trim();

  const selectedCampId = String(campId ?? "").trim();
  const [screeningPageSize, setScreeningPageSizeState] = useState(
    DEFAULT_SCREENING_PAGE_SIZE,
  );

  const [pagesByFilterKey, setPagesByFilterKey] = useState({});

  const screeningFilterKey = [
    selectedCampId,
    String(classFilter ?? "").trim(),
    String(sectionFilter ?? "").trim(),
  ].join("|");

  const screeningPages = pagesByFilterKey[screeningFilterKey] ?? DEFAULT_SCREENING_PAGES;

  const goToScreeningPage = useCallback(
    (type, page) => {
      const nextPage = Math.max(1, Number(page) || 1);

      setPagesByFilterKey((prev) => {
        const current = prev[screeningFilterKey] ?? DEFAULT_SCREENING_PAGES;

        if (current[type] === nextPage) {
          return prev;
        }

        return {
          ...prev,
          [screeningFilterKey]: { ...current, [type]: nextPage },
        };
      });
    },
    [screeningFilterKey],
  );

  const setScreeningPageSize = useCallback(
    (size) => {
      const nextSize = Number(size);

      if (!Number.isFinite(nextSize) || nextSize <= 0) return;

      setScreeningPageSizeState(nextSize);
      // A new page size invalidates every page number - restart each tab.
      setPagesByFilterKey((prev) => ({
        ...prev,
        [screeningFilterKey]: DEFAULT_SCREENING_PAGES,
      }));
    },
    [screeningFilterKey],
  );

  const {
    data: screeningReportPayload,

    isLoading,

    error,
  } = useQuery({
    queryKey: [
      "general-screening-report",
      screeningPages.general,
      screeningPageSize,
      selectedCampId,
      studentId,
    ],

    queryFn: () =>
      dispatch(
        getAllScreeningRecord({
          page: screeningPages.general,
          per_page: screeningPageSize,
          camp_id: selectedCampId || undefined,
          student_id: studentId || undefined,
        }),
      ).unwrap(),

    // Keep the previous page visible while the next one loads.
    placeholderData: keepPreviousData,

    staleTime: 60_000,
  });

  console.log(screeningReportPayload,"screeningReportPayload");
  

  const {
    data: visionScreeningReportPayload,

    isLoading: visionLoading,

    error: visionError,
  } = useQuery({
    queryKey: [
      "vision-screening-report",
      screeningPages.vision,
      screeningPageSize,
      selectedCampId,
      studentId,
    ],

    queryFn: () =>
      dispatch(
        studentId
          ? getVisionScreening({ studentId, campId: selectedCampId })
          : getAllVisionScreeningReport({
              page: screeningPages.vision,
              per_page: screeningPageSize,
              camp_id: selectedCampId || undefined,
            }),
      ).unwrap(),

    // Keep the previous page visible while the next one loads.
    placeholderData: keepPreviousData,

    staleTime: 60_000,
  });
  const {
    data: dentalScreeningReportPayload,

    isLoading: dentalLoading,

    error: dentalError,
  } = useQuery({
    queryKey: [
      "dental-screening-report",
      screeningPages.dental,
      screeningPageSize,
      selectedCampId,
      studentId,
    ],

    queryFn: () =>
      dispatch(
        studentId
          ? getDentalScreening({ studentId, campId: selectedCampId })
          : getAllDentalScreeningReports({
              page: screeningPages.dental,
              per_page: screeningPageSize,
              camp_id: selectedCampId || undefined,
            }),
      ).unwrap(),

    // Keep the previous page visible while the next one loads.
    placeholderData: keepPreviousData,

    staleTime: 60_000,
  });

  const {
    data: hearingScreeningReportPayload,

    isLoading: hearingLoading,

    error: hearingError,
  } = useQuery({
    queryKey: [
      "hearing-screening-report",
      screeningPages.hearing,
      screeningPageSize,
      selectedCampId,
      studentId,
    ],

    queryFn: () =>
      dispatch(
        studentId
          ? getHearingScreening({ studentId, campId: selectedCampId })
          : getAllHearingScreeningReport({
              page: screeningPages.hearing,
              per_page: screeningPageSize,
              camp_id: selectedCampId || undefined,
            }),
      ).unwrap(),

    // Keep the previous page visible while the next one loads.
    placeholderData: keepPreviousData,

    staleTime: 60_000,
  });

  const {
    data: entScreeningReportPayload,

    isLoading: entLoading,

    error: entError,
  } = useQuery({
    queryKey: [
      "ent-screening-report",
      screeningPages.ent,
      screeningPageSize,
      selectedCampId,
      studentId,
    ],

    queryFn: () =>
      dispatch(
        studentId
          ? getEntScreening({ studentId, campId: selectedCampId })
          : getAllEntScreeningReport({
              page: screeningPages.ent,
              per_page: screeningPageSize,
              camp_id: selectedCampId || undefined,
            }),
      ).unwrap(),

    // Keep the previous page visible while the next one loads.
    placeholderData: keepPreviousData,

    staleTime: 60_000,
  });

  const allScreeningRecords = useMemo(() => {
    if (Array.isArray(screeningReportPayload)) return screeningReportPayload;

    if (Array.isArray(screeningReportPayload?.data)) {
      return screeningReportPayload.data;
    }

    if (Array.isArray(screeningReportPayload?.data?.data)) {
      return screeningReportPayload.data.data;
    }

    return [];
  }, [screeningReportPayload]);
console.log(allScreeningRecords,"allScreeningRecords");


  const campScreeningRecords = useMemo(() => {
    if (!selectedCampId) return studentId ? allScreeningRecords : [];

    return allScreeningRecords.filter((record) => {
      const recordCampKeys = [
        record?.camp_id,

        record?.campId,

        record?.medical_event_id,

        record?.medicalEventId,

        record?.event_id,

        record?.eventId,

        record?.camp?.id,

        record?.camp?.camp_id,
      ]

        .map((value) => String(value ?? "").trim())

        .filter(Boolean);

      return recordCampKeys.includes(selectedCampId);
    });
  }, [allScreeningRecords, selectedCampId, studentId]);

  const allDentalScreeningRecords = useMemo(() => {
    if (Array.isArray(dentalScreeningReportPayload)) {
      return dentalScreeningReportPayload;
    }

    if (Array.isArray(dentalScreeningReportPayload?.data)) {
      return dentalScreeningReportPayload.data;
    }

    if (Array.isArray(dentalScreeningReportPayload?.data?.data)) {
      return dentalScreeningReportPayload.data.data;
    }

    return [];
  }, [dentalScreeningReportPayload]);

  const allEntScreeningRecords = useMemo(() => {
    if (Array.isArray(entScreeningReportPayload)) {
      return entScreeningReportPayload;
    }

    if (Array.isArray(entScreeningReportPayload?.data)) {
      return entScreeningReportPayload.data;
    }

    if (Array.isArray(entScreeningReportPayload?.data?.data)) {
      return entScreeningReportPayload.data.data;
    }

    return [];
  }, [entScreeningReportPayload]);

  const campDentalScreeningRecords = useMemo(() => {
    if (studentId || !selectedCampId) {
      return studentId ? allDentalScreeningRecords : [];
    }

    const selectedId = String(selectedCampId).trim();

    return allDentalScreeningRecords.filter((record) => {
      const recordCampKeys = [
        // Direct fields

        record?.camp_id,

        record?.campId,

        record?.medical_event_id,

        record?.medicalEventId,

        record?.event_id,

        record?.eventId,

        // Nested camp

        record?.camp?.id,

        record?.camp?.camp_id,

        // Your API structure

        record?.report?.camp_id,

        record?.report?.campId,
      ]

        .map((value) => String(value ?? "").trim())

        .filter(Boolean);

      return recordCampKeys.includes(selectedId);
    });
  }, [allDentalScreeningRecords, selectedCampId, studentId]);

  const allVisionScreeningRecords = useMemo(() => {
    if (Array.isArray(visionScreeningReportPayload)) {
      return visionScreeningReportPayload;
    }

    if (Array.isArray(visionScreeningReportPayload?.data)) {
      return visionScreeningReportPayload.data;
    }

    if (Array.isArray(visionScreeningReportPayload?.data?.data)) {
      return visionScreeningReportPayload.data.data;
    }

    return [];
  }, [visionScreeningReportPayload]);

  const allHearingScreeningRecords = useMemo(() => {
    if (Array.isArray(hearingScreeningReportPayload)) {
      return hearingScreeningReportPayload;
    }

    if (Array.isArray(hearingScreeningReportPayload?.data)) {
      return hearingScreeningReportPayload.data;
    }

    if (Array.isArray(hearingScreeningReportPayload?.data?.data)) {
      return hearingScreeningReportPayload.data.data;
    }

    return [];
  }, [hearingScreeningReportPayload]);

  const campVisionScreeningRecords = useMemo(() => {
    if (studentId || !selectedCampId) {
      return studentId ? allVisionScreeningRecords : [];
    }

    return allVisionScreeningRecords.filter((record) => {
      const recordCampKeys = [
        record?.camp_id,

        record?.campId,

        record?.medical_event_id,

        record?.medicalEventId,

        record?.event_id,

        record?.eventId,

        record?.camp?.id,

        record?.camp?.camp_id,
      ]

        .map((value) => String(value ?? "").trim())

        .filter(Boolean);

      return recordCampKeys.includes(selectedCampId);
    });
  }, [allVisionScreeningRecords, selectedCampId, studentId]);
  const campHearingScreeningRecords = useMemo(() => {
    if (studentId || !selectedCampId) {
      return studentId ? allHearingScreeningRecords : [];
    }

    return allHearingScreeningRecords.filter((record) => {
      const recordCampKeys = [
        record?.camp_id,

        record?.campId,

        record?.medical_event_id,

        record?.medicalEventId,

        record?.event_id,

        record?.eventId,

        record?.camp?.id,

        record?.camp?.camp_id,
      ]

        .map((value) => String(value ?? "").trim())

        .filter(Boolean);

      return recordCampKeys.includes(selectedCampId);
    });
  }, [allHearingScreeningRecords, selectedCampId, studentId]);

  // Same camp scoping as the hearing/dental/vision memos above, but for
  // the ENT assessment records (GET /api/ent-assessment/all).
  const campEntScreeningRecords = useMemo(() => {
    if (studentId || !selectedCampId) {
      return studentId ? allEntScreeningRecords : [];
    }

    return allEntScreeningRecords.filter((record) => {
      const recordCampKeys = [
        record?.camp_id,
        record?.campId,
        record?.medical_event_id,
        record?.medicalEventId,
        record?.event_id,
        record?.eventId,
        record?.camp?.id,
        record?.camp?.camp_id,
      ]
        .map((value) => String(value ?? "").trim())
        .filter(Boolean);

      return recordCampKeys.includes(selectedCampId);
    });
  }, [allEntScreeningRecords, selectedCampId, studentId]);

  // Case-insensitive keys so a lowercased id still matches identifiers like

  // "STU-2401" (mirrors components/students/getScreeningRecord.js).

  const studentKeys = useMemo(
    () => new Set([studentId.toLowerCase()].filter(Boolean)),

    [studentId],
  );

  const generalScreeningRecord = useMemo(() => {
    if (!studentKeys.size || !allScreeningRecords.length) return null;

    // 1) Records belonging to this student.

    const studentMatches = allScreeningRecords.filter((record) => {
      const recordKeys = [
        record?.id,

        record?.cus_id,

        record?.CUS_ID,

        record?.student_cus_id,

        record?.student_id,

        record?.studentId,

        record?.school_registration_number,

        record?.admission_number,

        record?.student?.id,

        record?.student?.cus_id,

        record?.student?.school_registration_number,

        record?.student?.admission_number,
      ]

        .map((value) =>
          String(value ?? "")
            .trim()

            .toLowerCase(),
        )

        .filter(Boolean);

      return recordKeys.some((key) => studentKeys.has(key));
    });

    if (!studentMatches.length) return null;


    if (selectedCampId) {
      const campMatches = studentMatches.filter((record) => {
        const recordCampKeys = [
          record?.camp_id,

          record?.campId,

          record?.medical_event_id,

          record?.medicalEventId,

          record?.event_id,

          record?.eventId,

          record?.camp?.id,

          record?.camp?.camp_id,
        ]

          .map((value) => String(value ?? "").trim())

          .filter(Boolean);

        return recordCampKeys.includes(selectedCampId);
      });

      if (campMatches.length) return campMatches[0];
    }

    return studentMatches[0];
  }, [allScreeningRecords, studentKeys, selectedCampId]);

  const generalPagination = useMemo(
    () =>
      getScreeningPagination(screeningReportPayload, {
        page: screeningPages.general,
        pageSize: screeningPageSize,
      }),
    [screeningReportPayload, screeningPages.general, screeningPageSize],
  );

  const visionPagination = useMemo(
    () =>
      getScreeningPagination(visionScreeningReportPayload, {
        page: screeningPages.vision,
        pageSize: screeningPageSize,
      }),
    [visionScreeningReportPayload, screeningPages.vision, screeningPageSize],
  );

  const dentalPagination = useMemo(
    () =>
      getScreeningPagination(dentalScreeningReportPayload, {
        page: screeningPages.dental,
        pageSize: screeningPageSize,
      }),
    [dentalScreeningReportPayload, screeningPages.dental, screeningPageSize],
  );

  const hearingPagination = useMemo(
    () =>
      getScreeningPagination(hearingScreeningReportPayload, {
        page: screeningPages.hearing,
        pageSize: screeningPageSize,
      }),
    [hearingScreeningReportPayload, screeningPages.hearing, screeningPageSize],
  );

  const entPagination = useMemo(
    () =>
      getScreeningPagination(entScreeningReportPayload, {
        page: screeningPages.ent,
        pageSize: screeningPageSize,
      }),
    [entScreeningReportPayload, screeningPages.ent, screeningPageSize],
  );

  return {
    allScreeningRecords,
    screeningPages,
    screeningPageSize,
    goToScreeningPage,
    setScreeningPageSize,
    screeningPagination: {
      general: generalPagination,
      vision: visionPagination,
      dental: dentalPagination,
      hearing: hearingPagination,
      ent: entPagination,
    },

    campScreeningRecords: campScreeningRecords ?? [],

    allVisionScreeningRecords,

    campVisionScreeningRecords: campVisionScreeningRecords ?? [],

    allHearingScreeningRecords,

    campHearingScreeningRecords: campHearingScreeningRecords ?? [],

    allDentalScreeningRecords,
    allEntScreeningRecords,
    campDentalScreeningRecords: campDentalScreeningRecords ?? [],
    campEntScreeningRecords: campEntScreeningRecords ?? [],
    visionLoading,
    visionError,
    dentalLoading,
    dentalError,
    hearingLoading,
    entLoading,
    hearingError,
    entError,
    generalScreeningRecord,
    isLoading,
    error,
  };
};
