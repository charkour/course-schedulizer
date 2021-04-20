import { cloneDeep, map } from "lodash";
import { Course, CourseSectionMeeting, NonTeachingLoadInput, Section, Term } from "utilities";
import { emptyCourse, emptySection } from "utilities/constants";

export type CheckboxTerms = (Term | boolean)[];

export const mapNonTeachingLoadValuesToInput = (
  data?: CourseSectionMeeting,
): NonTeachingLoadInput => {
  const terms = addFalseToTermsCheckboxList(data?.section.term as Term[]);

  return {
    activity: data?.section.instructionalMethod ?? "",
    facultyHours:
      data?.section.facultyHours !== undefined && data.section.facultyHours > -1
        ? data.section.facultyHours
        : undefined,
    instructor: data?.section.instructors ?? [],
    terms,
  };
};

export const mapNonTeachingLoadInput = (data: NonTeachingLoadInput) => {
  const newSection: Section = cloneDeep(emptySection);
  const newCourse: Course = cloneDeep(emptyCourse);
  newSection.instructionalMethod = data.activity;
  newSection.facultyHours = data.facultyHours ?? 0;
  newSection.instructors = data.instructor;
  newSection.isNonTeaching = true;
  newSection.term = data.terms as Term[];
  return { newCourse, newSection };
};

export const addFalseToTermsCheckboxList = (terms?: Term[]): CheckboxTerms => {
  const termValues = Object.values(Term);
  if (!terms) {
    return new Array(termValues.length).fill(false);
  }
  return map(termValues, (t) => {
    return terms.includes(t) ? t : false;
  });
};
