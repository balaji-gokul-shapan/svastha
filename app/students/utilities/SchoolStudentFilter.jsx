import ReusableSelect from "@/components/ui/reusable-select";
import { getFilterStudent } from "@/lib/features/getFilterStudent";
import { getAllSchoolBranches } from "@/lib/features/registerSchoolBranchSlice";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { useDispatch } from "react-redux";

const SchoolStudentFilter = ({ formData, setFormData, selectRole }) => {
  const dispatch = useDispatch();
  const roles = {
    1: "admin",
    2: "school",
    3: "teacher",
  };

  const getRole = roles[selectRole] ?? "";
  console.log(formData.branchName,"branc");
  

  const {
    data: getAllSchoolBranch = {},
    isLoading: getAllSchoolBranchLoading,
    error: getAllSchoolBranchError,
  } = useQuery({
    queryKey: ["getSchoolAllBranch"],
    queryFn: () => dispatch(getAllSchoolBranches()).unwrap(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  console.log(getAllSchoolBranch,"getAllSchoolBranch");
// getFilterStudent
  const {
    data: getAllFilterStudent = {},
    isLoading: getAllFilterStudentLoading,
    error: getAllFilterStudentError,
  } = useQuery({
    queryKey: ["getAllFilterStudent", formData.branchName],
    queryFn: () =>
      dispatch(getFilterStudent({ branch_id: formData.branchName })).unwrap(),
    enabled: Boolean(formData.branchName),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  console.log(getAllFilterStudent,"getAllFilterStudent");
  
  const branchOptions = (
    Array.isArray(getAllSchoolBranch)
      ? getAllSchoolBranch
      : (getAllSchoolBranch?.data ?? [])
  )
    .map((branch) => ({
      value: String(branch?.id ?? branch?.branch_id ?? ""),
      label: branch?.branch_name ?? branch?.name ?? "",
    }))
    .filter((option) => option.value && option.label);

  const handleChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value ?? "",
    }));
  };

  return (
    <>
      <div
        className={`grid gap-3 sm:grid-cols-2 ${
          getRole ? "xl:grid-cols-5" : "xl:grid-cols-4"
        }`}
      >
        {getRole && (
          <>
            <ReusableSelect
              name="branchName"
              label="Camp Name"
              searchPlaceholder="Search Camp"
              options={branchOptions}
              value={formData.branchName}
              onChange={(value) => handleChange("branchName", value)}
            />
          </>
        )}
      </div>
    </>
  );
};

export default SchoolStudentFilter;
