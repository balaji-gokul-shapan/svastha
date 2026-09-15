"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingOverlay, TableSkeleton } from "@/components/ui/loading-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StudentsDataTable } from "./utilities/students-data-table";
import { StudentsCards } from "./utilities/students-cards";
import { Pagination } from "@/components/ui/pagination";
import { LayoutGrid, List, PlusCircle } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { getAllStudent } from "@/lib/features/getAllStudentSlice";
import { getFilterStudent } from "@/lib/features/getFilterStudent";
import FileUploadModal from "@/components/students/fileUploadModal";
import StudentFilter from "../health-checks/utilities/studentFilter";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import SchoolStudentFilter from "./utilities/SchoolStudentFilter";
import { selectUserAccount } from "@/lib/features/auth-slice";
import { useAuthRole } from "@/lib/user-role";

// Default value for every filter â€” values equal to these are kept out of
// the URL so links stay tidy.
const FILTER_DEFAULTS = {
  search: "",
  status: "all",
  class: "all",
  section: "all",
  branch_id: "all",
  academicYear: "all",
  student: "all",
  sortBy: "name",
  sortOrder: "asc",
  view: "card",
};

function StudentsList() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? "all";
  const classFilter = searchParams.get("class") ?? "all";
  const sectionFilter = searchParams.get("section") ?? "all";
  const schoolName = searchParams.get("branch_id") ?? "all";
  const academicYear = searchParams.get("academicYear") ?? "all";
  const studentFilter = searchParams.get("student") ?? "all";
  const sortBy = searchParams.get("sortBy") ?? "name";
  const sortOrder = searchParams.get("sortOrder") ?? "asc";
  const appearanceSettings = useAppSelector(
    (state) => state.appearanceSettings,
  );
  const { theme, transparentSidebar, sidebarFeature, tableView } =
    appearanceSettings ?? {};
  console.log(tableView, "tableView");
  const viewMode = searchParams.get("view") ?? "card";
  const limit = tableView === "card" ? 9 : 10;
  const { studentData, total, loading, error } = useAppSelector(
    (state) => state.getAllStudent,
  );
  const selectUser = useAppSelector(selectUserAccount);
  console.log(selectUser, "selectUserAccount");

  // Merge a patch of filter changes into the current query string.
  // Filters reset to their default are removed from the URL entirely.
  const updateParams = React.useCallback(
    (patch) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(patch).forEach(([key, value]) => {
        if (String(value) === String(FILTER_DEFAULTS[key] ?? "")) {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      });
      const queryString = params.toString();
      router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router, searchParams],
  );

  const setPage = React.useCallback(
    (nextPage) => updateParams({ page: Math.max(1, Number(nextPage) || 1) }),
    [updateParams],
  );

  const setViewMode = React.useCallback(
    (nextView) => updateParams({ view: nextView }),
    [updateParams],
  );

  const [searchInput, setSearchInput] = React.useState(search);
  React.useEffect(() => {
    setSearchInput(search);
  }, [search]);

  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchInput.trim() !== search) {
        updateParams({ search: searchInput.trim(), page: 1 });
      }
    }, 400);
    return () => {
      clearTimeout(timeoutId);
    };
    // Only re-arm the debounce timer when the user types.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const handleStatusChange = (value) =>
    updateParams({ status: value, page: 1 });

  const handleSortByChange = (value) =>
    updateParams({ sortBy: value, page: 1 });

  const handleSortOrderChange = (value) =>
    updateParams({ sortOrder: value, page: 1 });

  const handleClassChange = (value) =>
    updateParams({ class: value, section: "all", page: 1 });

  const handleSectionChange = (value) =>
    updateParams({ section: value, page: 1 });

  const { isFetching, refetch: refetchStudents } = useQuery({
    queryKey: [
      "students",
      page,
      limit,
      search,
      status,
      schoolName,
      academicYear,
      classFilter,
      sectionFilter,
      sortBy,
      sortOrder,
    ],
    queryFn: () =>
      dispatch(
        getAllStudent({
          page,
          limit,
          search,
          status,
          schoolName,
          academicYear,
          classFilter,
          sectionFilter,
          sortBy,
          sortOrder,
        }),
      ).unwrap(),
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  // Backend joins can return the same student more than once (e.g. the
  // same cus_id on several rows), which breaks React keys and shows
  // duplicate cards. Keep the first occurrence per identifier.
  const rows = React.useMemo(() => {
    const list = Array.isArray(studentData) ? studentData : [];
    const seen = new Set();
    const unique = [];

    list.forEach((student) => {
      const identity =
        String(
          student?.cus_id ??
            student?.id ??
            student?.studentId ??
            student?.student_id ??
            student?.school_registration_number ??
            student?.admission_number ??
            student?.name ??
            "",
        )
          .trim()
          .toLowerCase() || `row-${unique.length}`;

      if (seen.has(identity)) {
        return;
      }

      seen.add(identity);
      unique.push(student);
    });

    if (
      process.env.NODE_ENV !== "production" &&
      unique.length !== list.length
    ) {
      console.warn(
        `[StudentsPage] Removed ${list.length - unique.length} duplicate student row(s) from the API response.`,
      );
    }

    return unique;
  }, [studentData]);
  const isInitialLoading = loading && rows.length === 0;
  const isRefreshing = isFetching && rows.length > 0;
  const totalPages = Math.max(1, Math.ceil((total || 0) / limit));

  // The signed-in account's OWN branch. Used as the default value of the
  // School Name filter when the URL carries no branch (see the sync effect
  // below — without it the dropdown is blanked out). Kept as a STRING because
  // the dropdown's option values are strings ("2", not 2).
  const defaultBranchId = React.useMemo(
    () =>
      String(
        selectUser?.branch_id ??
          selectUser?.branchId ??
          selectUser?.branch?.id ??
          "",
      ).trim(),
    [selectUser],
  );

 const [filterFormData, setFilterFormData] = React.useState({
  branchName: defaultBranchId,
  AcademicYear: "2026 - 2027",
  classes: "",
  section: "",
  BeneficiaryId: "",
});

  // Keep the SchoolStudentFilter form state in sync with the URL query
  // string. The dropdowns are controlled by filterFormData, so without this
  // they'd reset to empty whenever this page remounts — e.g. after the
  // "Back to Students" button returns from a student's detail page, or on
  // browser back/forward — even though the URL (and therefore the results)
  // still carry the filters.
  const filterFormValue = React.useCallback(
    (value, defaultValue = "all") =>
      value === undefined ||
      value === null ||
      String(value) === String(defaultValue)
        ? ""
        : String(value),
    [],
  );

  React.useEffect(() => {
    setFilterFormData((prev) => {
      const next = {
        branchName: filterFormValue(schoolName) || defaultBranchId,
        AcademicYear:
          academicYear === "all" ||
          String(academicYear) === FILTER_DEFAULTS.academicYear
            ? ""
            : String(academicYear),
        classes: filterFormValue(classFilter),
        section: filterFormValue(sectionFilter),
        BeneficiaryId: filterFormValue(studentFilter),
      };
      return JSON.stringify(next) === JSON.stringify(prev) ? prev : next;
    });
  }, [
    schoolName,
    defaultBranchId,
    academicYear,
    classFilter,
    sectionFilter,
    studentFilter,
    filterFormValue,
  ]);

  
console.log(filterFormData,"filterFormData");

  // const classOptions = React.useMemo(() => {
  //   const classSet = new Set([
  //     "Pre-KG",
  //     "LKG",
  //     "UKG",
  //     "1",
  //     "2",
  //     "3",
  //     "4",
  //     "5",
  //     "6",
  //     "7",
  //     "8",
  //     "9",
  //     "10",
  //     "11",
  //     "12",
  //   ]);

  //   rows.forEach((student) => {
  //     const classValue = String(
  //       student?.Class ?? student?.class ?? student?.grade ?? "",
  //     ).trim();
  //     if (classValue) {
  //       classSet.add(classValue);
  //     }
  //   });

  //   return [
  //     "all",
  //     ...Array.from(classSet).sort((a, b) =>
  //       a.localeCompare(b, undefined, { numeric: true }),
  //     ),
  //   ];
  // }, [rows]);

  // const sectionOptions = React.useMemo(() => {
  //   const sectionSet = new Set(["A", "B", "C", "D", "E", "F"]);

  //   rows.forEach((student) => {
  //     const classValue = String(
  //       student?.Class ?? student?.class ?? student?.grade ?? "",
  //     ).trim();
  //     if (classFilter !== "all" && classValue !== classFilter) {
  //       return;
  //     }

  //     const sectionValue = String(
  //       student?.sec ?? student?.section ?? "",
  //     ).trim();
  //     if (sectionValue) {
  //       sectionSet.add(sectionValue);
  //     }
  //   });

  //   return [
  //     "all",
  //     ...Array.from(sectionSet).sort((a, b) =>
  //       a.localeCompare(b, undefined, { numeric: true }),
  //     ),
  //   ];
  // }, [classFilter, rows]);
  
    // const account = useAppSelector(selectUserAccount);
    // console.log(account, "accountee")

   const getRole = useAuthRole();
   console.log(getRole,"getRolesssss");
   

  const { data: filterPayload, isLoading } = useQuery({
    queryKey: ["filter-student", schoolName, academicYear, classFilter, sectionFilter, "options"],
    // Only run when there's an actual filter to send. With the defaults
    // (no branch, academicYear "all") this would POST only page/per_page/sort,
    // which the backend rejects with "at least one parameter is required".
    // filterPayload isn't consumed by SchoolStudentFilter (it builds its own
    // options), so it's safe to skip until a branch or a concrete year exists.
    enabled:
      Boolean(schoolName && schoolName !== "all") ||
      Boolean(academicYear && academicYear !== "all")||
      Boolean(classFilter && classFilter !== "all") ||
      Boolean(sectionFilter && sectionFilter !== "all"),
    queryFn: () =>
      dispatch(
        getFilterStudent({
          all: true,
          status: "all",
          // The backend's valid filters are branch_id/class/sec/academic_year
          // (no `school`). Send the selected branch id as `branch_id`, not as
          // `schoolName` (which would map to an unrecognised `school` param
          // and fail with "at least one filter parameter required").
          branch_id: schoolName,
          academicYear,
          classFilter,
          sectionFilter,
          sortBy: "name",
          sortOrder: "asc",
          search: "",
        }),
      ).unwrap(),
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="">
          <h2 className="font-sf text-2xl font-bold text-foreground">
            Students
          </h2>
          <p className="text-sm text-muted-foreground">
            View student records, grade section, and follow-up status.
          </p>
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:flex-nowrap">
          <FileUploadModal onSuccess={() => refetchStudents()} />
          {/* <div className="inline-flex items-center rounded-md border border-border p-1">
            <Button
              type="button"
              variant={tableView === "table" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("table")}
              className="h-8 px-2"
            >
              <List className="mr-1 size-4" />
              Table
            </Button>
            <Button
              type="button"
              variant={tableView === "card" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("card")}
              className="h-8 px-2"
            >
              <LayoutGrid className="mr-1 size-4" />
              Cards
            </Button>
          </div> */}

          <Link href="/students/add" className="w-full sm:w-auto">
            <Button variant="default" size="lg" className="w-auto">
              <PlusCircle className="size-4 mr-2" />
              Add Student
            </Button>
          </Link>
        </div>
      </div>

      {/* <div className="grid gap-3 rounded-xl border border-border bg-card p-3 sm:grid-cols-2 lg:grid-cols-4">
        <Input
          value={searchInput}
          onChange={(event) => {
            setSearchInput(event.target.value);
            setPage(1);
          }}
          placeholder="Search students..."
        />
        <Select value={status} onValueChange={handleStatusChange}>
          <SelectTrigger>
            <SelectValue placeholder="All status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Follow-up">Follow-up</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={handleSortByChange}>
          <SelectTrigger>
            <SelectValue placeholder="Sort by name" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Sort by name</SelectItem>
            <SelectItem value="studentId">Sort by student ID</SelectItem>
            <SelectItem value="grade">Sort by grade</SelectItem>
            <SelectItem value="status">Sort by status</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortOrder} onValueChange={handleSortOrderChange}>
          <SelectTrigger>
            <SelectValue placeholder="Ascending" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="asc">Ascending</SelectItem>
            <SelectItem value="desc">Descending</SelectItem>
          </SelectContent>
        </Select>
      </div> */}
      {/* <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3 rounded-xl border border-border bg-card p-3">
        <Input
          value={searchInput}
          onChange={(event) => {
            setSearchInput(event.target.value);
            setPage(1);
          }}
          placeholder="Search students..."
        />
       
        <Select value={status} onValueChange={handleStatusChange}>
          <SelectTrigger>
            <SelectValue placeholder="All status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Follow-up">Follow-up</SelectItem>
          </SelectContent>
        </Select>
        <Select value={classFilter} onValueChange={handleClassChange}>
          <SelectTrigger>
            <SelectValue placeholder="All classes" />
          </SelectTrigger>
          <SelectContent>
            {classOptions.map((classValue) => (
              <SelectItem key={classValue} value={classValue}>
                {classValue === "all" ? "All classes" : classValue}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sectionFilter} onValueChange={handleSectionChange}>
          <SelectTrigger>
            <SelectValue placeholder="All sections" />
          </SelectTrigger>
          <SelectContent>
            {sectionOptions.map((sectionValue) => (
              <SelectItem key={sectionValue} value={sectionValue}>
                {sectionValue === "all" ? "All sections" : sectionValue}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
      </div> */}
      {/* <StudentFilter
        filterPayload={filterPayload}
        isLoading={isLoading}
        schoolName={schoolName}
        academicYear={academicYear}
        classFilter={classFilter}
        sectionFilter={sectionFilter}
        studentFilter={studentFilter}
        onSchoolNameChange={(value) => {
          updateParams({
            branch_id: value,
            class: "all",
            section: "all",
            student: "all",
            page: 1,
          });
        }}
        onAcademicYearChange={(value) => {
          updateParams({
            academicYear: value,
            class: "all",
            section: "all",
            student: "all",
            page: 1,
          });
        }}
        onClassFilterChange={(value) => {
          updateParams({
            class: value,
            section: "all",
            student: "all",
            page: 1,
          });
        }}
        onSectionFilterChange={(value) => {
          updateParams({ section: value, student: "all", page: 1 });
        }}
        onStudentFilterChange={(value) => {
          updateParams({ student: value });
        }}
      /> */}
      <SchoolStudentFilter
        formData={filterFormData}
        setFormData={setFilterFormData}
        selectRole={selectUser.user_type_id}
        // Fallback branch for roles that can't fetch /schools/branch/all
        // (school_sub_account) — their OWN branch from the account.
        ownBranch={{
          value: defaultBranchId,
          label: String(
            selectUser?.branch_name ??
              selectUser?.name ??
              selectUser?.school_name ??
              selectUser?.schoolName ??
              "",
          ).trim(),
        }}
        filterPayload={filterPayload}
        isLoading={isLoading}
        schoolName={schoolName}
        academicYear={academicYear}
        classFilter={classFilter}
        sectionFilter={sectionFilter}
        studentFilter={studentFilter}
        onSchoolNameChange={(value) => {
          updateParams({
            branch_id: value,
            class: "all",
            section: "all",
            student: "all",
            page: 1,
          });
        }}
        onAcademicYearChange={(value) => {
          updateParams({
            academicYear: value,
            class: "all",
            section: "all",
            student: "all",
            page: 1,
          });
        }}
        onClassFilterChange={(value) => {
          updateParams({
            class: value,
            section: "all",
            student: "all",
            page: 1,
          });
        }}
        onSectionFilterChange={(value) => {
          updateParams({ section: value, student: "all", page: 1 });
        }}
        onStudentFilterChange={(value) => {
          updateParams({ student: value });
        }}
      />
      {/* <div className="grid gap-2 bg-"></div> */}

      {/* <div className="min-h-5 d-none">
        {isInitialLoading ? <LoadingText label="Loading students..." /> : null}
        {!isInitialLoading && isRefreshing ? <LoadingText label="Refreshing students..." /> : null}
      </div> */}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="relative min-h-90 mb-0">
        {isInitialLoading ? (
          <TableSkeleton rows={limit} cols={8} />
        ) : tableView === "table" ? (
          <StudentsDataTable
            data={rows}
            backQuery={searchParams.toString()}
            onDeleted={refetchStudents}
          />
        ) : (
          <StudentsCards
            data={rows}
            backQuery={searchParams.toString()}
            onDeleted={refetchStudents}
          />
        )}

        {isRefreshing ? <LoadingOverlay label="Updating..." /> : null}
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        onChange={setPage}
        disabled={isInitialLoading}
      />
    </section>
  );
}

// `useSearchParams()` requires a Suspense boundary during prerendering,
// so the list is rendered behind one.
export default function StudentsPage() {
  return (
    <React.Suspense fallback={null}>
      <StudentsList />
    </React.Suspense>
  );
}





