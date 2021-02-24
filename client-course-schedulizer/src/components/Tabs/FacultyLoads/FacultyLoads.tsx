/* eslint-disable react/jsx-key */
import {
  Modal,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow as FacultyRow,
} from "@material-ui/core";
import React, { useContext, useMemo, useState } from "react";
import { Cell, Column, useTable } from "react-table";
import { Course, CourseSectionMeeting, getSectionName, Schedule, Section, Term } from "utilities";
import { AppContext } from "utilities/contexts";
import { findSection } from "utilities/services/facultyLoadsService";
import { AddNonTeachingLoadPopover, AddSectionPopover, PopoverButton } from "../../reuseables";
import "./FacultyLoads.scss";

type hourKeys = "fallHours" | "springHours" | "summerHours" | "totalHours" | "otherHours";
type sectionKeys =
  | "fallCourseSections"
  | "springCourseSections"
  | "summerCourseSections"
  | "otherDuties";

type FacultyRow = {
  [key in hourKeys]?: number;
} &
  {
    [key in sectionKeys]?: string;
  } & {
    faculty: string;
    loadNotes?: string;
    otherDuties?: string;
  };

interface UpdateRowParams {
  course: Course;
  newRow: FacultyRow;
  prevRow: FacultyRow;
  section: Section;
  sectionName: string;
  termName?: "fall" | "spring" | "summer" | "other";
}

const updateRow = ({
  course,
  newRow,
  prevRow,
  section,
  sectionName,
  termName,
}: UpdateRowParams) => {
  const termCourseSectionProp =
    termName === "other" ? "otherDuties" : (`${termName}CourseSections` as sectionKeys);
  const termHoursProp = `${termName}Hours` as hourKeys;
  const facultyHours =
    (section.facultyHours !== undefined ? section.facultyHours : course.facultyHours) /
    section.instructors.length;
  if (prevRow) {
    prevRow[termCourseSectionProp] = prevRow[termCourseSectionProp]
      ? (prevRow[termCourseSectionProp] = `${prevRow[termCourseSectionProp]}, ${sectionName}`)
      : (prevRow[termCourseSectionProp] = sectionName);

    prevRow[termHoursProp] = prevRow[termHoursProp]
      ? Number(prevRow[termHoursProp]) / section.instructors.length + facultyHours
      : facultyHours;

    if (termName === "other") {
      prevRow[termCourseSectionProp] += ` (${facultyHours})`;
    }
  } else {
    newRow[termCourseSectionProp] = sectionName;
    newRow[termHoursProp] = facultyHours;
    if (termName === "other") {
      newRow[termCourseSectionProp] += ` (${facultyHours})`;
    }
  }
};

const createTable = (schedule: Schedule): FacultyRow[] => {
  const newTableData: FacultyRow[] = [];
  schedule.courses.forEach((course) => {
    course.sections.forEach((section) => {
      const sectionName = getSectionName(course, section);
      section.instructors.forEach((instructor) => {
        const newFacultyRow: FacultyRow = {
          faculty: instructor,
        };
        const [prevAddedFacultyRow] = newTableData.filter((data) => {
          return data.faculty === instructor;
        });
        const updateArgs = {
          course,
          newRow: newFacultyRow,
          prevRow: prevAddedFacultyRow,
          section,
          sectionName,
        };
        if (section.isNonTeaching) {
          updateRow({ ...updateArgs, sectionName: section.instructionalMethod, termName: "other" });
        } else {
          switch (section.term) {
            case Term.Fall:
              updateRow({ ...updateArgs, termName: "fall" });
              break;
            case Term.Spring:
              updateRow({ ...updateArgs, termName: "spring" });
              break;
            case Term.Summer:
            case Term.Interim:
              updateRow({ ...updateArgs, termName: "summer" });
              break;
            default:
              // eslint-disable-next-line no-console
              console.log(`Fell through case statement with value ${section.term}`);
              break;
          }
        }
        if (prevAddedFacultyRow) {
          newTableData[newTableData.indexOf(prevAddedFacultyRow)] = prevAddedFacultyRow;
        } else {
          newTableData.push(newFacultyRow);
        }
      });
    });
  });
  return newTableData
    .map((row) => {
      return {
        ...row,
        totalHours:
          (row.fallHours || 0) +
          (row.springHours || 0) +
          (row.summerHours || 0) +
          (row.otherHours || 0),
      };
    })
    .sort((a, b) => {
      return b.totalHours - a.totalHours;
    });
};

export const FacultyLoads = () => {
  const {
    appState: { schedule },
  } = useContext(AppContext);

  const handleCellClick = (cell: Cell<FacultyRow>) => {
    if (cell.value && typeof cell.value === "string") {
      const sectionNames = cell.value.split(", ");
      switch (cell.column.Header) {
        case "Fall Course Sections":
          setModalValues(findSection(schedule, sectionNames[0], Term.Fall));
          setOpen(true);
          break;
        case "Spring Course Sections":
          setModalValues(findSection(schedule, sectionNames[0], Term.Spring));
          setOpen(true);
          break;
        case "Summer Course Sections":
          try {
            setModalValues(findSection(schedule, sectionNames[0], Term.Summer));
          } catch (e) {
            setModalValues(findSection(schedule, sectionNames[0], Term.Interim));
          }
          setOpen(true);
          break;
        default:
          break;
      }
    }
  };

  const data = useMemo<FacultyRow[]>(() => {
    return createTable(schedule);
  }, [schedule]);

  const [open, setOpen] = useState(false);
  const [modalValues, setModalValues] = useState<CourseSectionMeeting>();

  const handleClose = () => {
    setOpen(false);
  };

  const columns = useMemo<Column<FacultyRow>[]>(() => {
    return [
      { Header: "Faculty", accessor: "faculty" },
      { Header: "Total Hours", accessor: "totalHours" },
      { Header: "Fall Course Sections", accessor: "fallCourseSections" },
      { Header: "Fall Hours", accessor: "fallHours" },
      { Header: "Spring Course Sections", accessor: "springCourseSections" },
      { Header: "Spring Hours", accessor: "springHours" },
      { Header: "Summer Course Sections", accessor: "summerCourseSections" },
      { Header: "Summer Hours", accessor: "summerHours" },
      { Header: "Other Duties", accessor: "otherDuties" },
      { Header: "Other Hours", accessor: "otherHours" },
    ];
  }, []);
  const tableInstance = useTable({ columns, data });

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = tableInstance;

  // https://react-table.tanstack.com/docs/quick-start
  return (
    <>
      <Modal className="add-section-modal" onClose={handleClose} open={open}>
        <Paper className="add-section-modal-paper">
          <AddSectionPopover values={modalValues} />
        </Paper>
      </Modal>
      <TableContainer component={Paper}>
        <PopoverButton buttonTitle="Add Non-Teaching Load" popupId="addNonTeachingLoad">
          <AddNonTeachingLoadPopover />
        </PopoverButton>
        <Table {...getTableProps()}>
          <TableHead>
            {
              // Loop over the header rows
              headerGroups.map((headerGroup) => {
                return (
                  // Apply the header row props
                  <FacultyRow {...headerGroup.getHeaderGroupProps()}>
                    {
                      // Loop over the headers in each row
                      headerGroup.headers.map((column) => {
                        return (
                          // Apply the header cell props
                          <TableCell {...column.getHeaderProps()}>
                            {
                              // Render the header
                              column.render("Header")
                            }
                          </TableCell>
                        );
                      })
                    }
                  </FacultyRow>
                );
              })
            }
          </TableHead>
          {/* Apply the table body props */}
          <TableBody {...getTableBodyProps()}>
            {
              // Loop over the table rows
              rows.map((row) => {
                // Prepare the row for display
                prepareRow(row);
                return (
                  // Apply the row props
                  <FacultyRow {...row.getRowProps()}>
                    {
                      // Loop over the rows cells
                      row.cells.map((cell) => {
                        // Apply the cell props
                        return (
                          <TableCell
                            {...cell.getCellProps()}
                            onClick={() => {
                              handleCellClick(cell);
                            }}
                          >
                            {
                              // Render the cell contents
                              cell.render("Cell")
                            }
                          </TableCell>
                        );
                      })
                    }
                  </FacultyRow>
                );
              })
            }
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};
