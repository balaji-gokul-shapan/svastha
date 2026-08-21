"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingOverlay, TableSkeleton } from "@/components/ui/loading-state";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StudentsDataTable } from "./students-data-table";
import { StudentsCards } from "./students-cards";
import { CircleArrowLeft, CircleArrowRight, LayoutGrid, List, PlusCircle } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { getAllStudent } from "@/lib/features/getAllStudentSlice";
import { getFilterStudent } from "@/lib/features/getFilterStudent";
import FileUploadModal from "@/components/students/fileUploadModal";
import StudentFilter from "../health-checks/utilities/studentFilter";

export default function StudentsPage() {
  const dispatch = useAppDispatch();
  const [page, setPage] = React.useState(1);
  const limit = 10;
  const [searchInput, setSearchInput] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState("all");
  const [classFilter, setClassFilter] = React.useState("all");
  const [sectionFilter, setSectionFilter] = React.useState("all");
  const [schoolName, setSchoolName] = React.useState("all");
  const [academicYear, setAcademicYear] = React.useState("2026-2027");
  const [studentId, setStudentId] = React.useState("");
  const [studentFilter, setStudentFilter] = React.useState("all");
  const [sortBy, setSortBy] = React.useState("name");
  const [sortOrder, setSortOrder] = React.useState("asc");
  const [viewMode, setViewMode] = React.useState("card");

  const { studentData, total, loading, error } = useAppSelector((state) => state.getAllStudent);

  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearch(searchInput.trim());
    }, 400);
    return () => {
      clearTimeout(timeoutId);
    };
  }, [searchInput]);

  const handleStatusChange = (value) => {
    setStatus(value);
    setPage(1);
  };

  const handleSortByChange = (value) => {
    setSortBy(value);
    setPage(1);
  };

  const handleSortOrderChange = (value) => {
    setSortOrder(value);
    setPage(1);
  };

  const handleClassChange = (value) => {
    setClassFilter(value);
    setSectionFilter("all");
    setPage(1);
  };

  const handleSectionChange = (value) => {
    setSectionFilter(value);
    setPage(1);
  };

  const { isFetching } = useQuery({
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

  const rows = React.useMemo(() => (Array.isArray(studentData) ? studentData : []), [studentData]);
  const isInitialLoading = loading && rows.length === 0;
  const isRefreshing = isFetching && rows.length > 0;
  const totalPages = Math.max(1, Math.ceil((total || 0) / limit));

  const classOptions = React.useMemo(() => {
    const classSet = new Set([
      "Pre-KG",
      "LKG",
      "UKG",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "11",
      "12",
    ]);

    rows.forEach((student) => {
      const classValue = String(student?.Class ?? student?.class ?? student?.grade ?? "").trim();
      if (classValue) {
        classSet.add(classValue);
      }
    });

    return ["all", ...Array.from(classSet).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))];
  }, [rows]);

  const sectionOptions = React.useMemo(() => {
    const sectionSet = new Set(["A", "B", "C", "D", "E", "F"]);

    rows.forEach((student) => {
      const classValue = String(student?.Class ?? student?.class ?? student?.grade ?? "").trim();
      if (classFilter !== "all" && classValue !== classFilter) {
        return;
      }

      const sectionValue = String(student?.sec ?? student?.section ?? "").trim();
      if (sectionValue) {
        sectionSet.add(sectionValue);
      }
    });

    return ["all", ...Array.from(sectionSet).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))];
  }, [classFilter, rows]);

  const { data: filterPayload, isLoading } = useQuery({
    queryKey: ["filter-student", schoolName, academicYear, "options"],
    queryFn: () =>
      dispatch(
        getFilterStudent({
          all: true,
          status: "all",
          schoolName,
          academicYear,
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
          <h2 className="font-display text-2xl font-semibold text-foreground">Students</h2>
          <p className="text-sm text-muted-foreground">
            View student records, grade section, and follow-up status.
          </p>
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:flex-nowrap">
          <FileUploadModal />
          <div className="inline-flex items-center rounded-md border border-border p-1">
            <Button
              type="button"
              variant={viewMode === "table" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("table")}
              className="h-8 px-2"
            >
              <List className="mr-1 size-4" />
              Table
            </Button>
            <Button
              type="button"
              variant={viewMode === "card" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("card")}
              className="h-8 px-2"
            >
              <LayoutGrid className="mr-1 size-4" />
              Cards
            </Button>
          </div>

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
      <StudentFilter
        filterPayload={filterPayload}
        isLoading={isLoading}
        schoolName={schoolName}
        academicYear={academicYear}
        classFilter={classFilter}
        sectionFilter={sectionFilter}
        studentFilter={studentFilter}
        onSchoolNameChange={(value) => {
          setSchoolName(value);
          setClassFilter("all");
          setSectionFilter("all");
          setStudentFilter("all");
          setStudentId("");
        }}
        onAcademicYearChange={(value) => {
          setAcademicYear(value);
          setClassFilter("all");
          setSectionFilter("all");
          setStudentFilter("all");
          setStudentId("");
        }}
        onClassFilterChange={(value) => {
          setClassFilter(value);
          setSectionFilter("all");
          setStudentFilter("all");
          setStudentId("");
        }}
        onSectionFilterChange={(value) => {
          setSectionFilter(value);
          setStudentFilter("all");
          setStudentId("");
        }}
        onStudentFilterChange={(value) => {
          setStudentFilter(value);
          setStudentId(value === "all" ? "" : value);
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
        ) : viewMode === "table" ? (
          <StudentsDataTable data={rows} />
        ) : (
          <StudentsCards data={rows} />
        )}

        {isRefreshing ? <LoadingOverlay label="Updating..." /> : null}
      </div>

      <div className="flex flex-col gap-2 px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </p>
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page === 1 || isInitialLoading}
          >
            <CircleArrowLeft className="size-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={page >= totalPages || isInitialLoading}
          >
            <CircleArrowRight className="size-4" />
            Next
          </Button>
        </div>
      </div>
    </section>
  );
}
