import { SchoolTypeValue } from '~/components/AI/AIForm/AIFormSchoolType/useAIFormSchoolType';
import referentielJson from './referentiel_2026-2027.json';
import { useSequenceFormValuesStore } from '~/store/assistant/sequence/sequenceStore';

export const useReferentiel = () => {
  // get the Form Values from the Store
  const formValues = useSequenceFormValuesStore();

  // School type values
  const schoolTypeValues: SchoolTypeValue[] = Object.keys(
    referentielJson,
  ) as SchoolTypeValue[];
  console.log(schoolTypeValues);

  // key to select data of a schoolType in the json referential
  const selectedSchoolTypeAsKey =
    formValues.schoolType as keyof typeof referentielJson;

  // Level values
  let levelValues: string[] = [];
  if (formValues.schoolType) {
    levelValues = referentielJson[selectedSchoolTypeAsKey].map((schoolType) => {
      return schoolType.value;
    });
  }
  console.log('levelValues', levelValues);

  // Subject values
  let subjectValues: string[] = [];

  if (formValues.schoolType && formValues.level) {
    const selectedLevel = referentielJson[selectedSchoolTypeAsKey]?.find(
      (level) => level.value === formValues.level,
    );
    subjectValues =
      selectedLevel && 'subjects' in selectedLevel
        ? selectedLevel.subjects.map((subject) => subject.value)
        : [];
  }

  console.log('subjectValues', subjectValues);

  // Sequence values
  const selectedLevel = referentielJson[selectedSchoolTypeAsKey]?.find(
    (level) => level.value === formValues.level,
  );

  const sequenceValues: string[] =
    formValues.subject && selectedLevel && 'subjects' in selectedLevel
      ? (selectedLevel.subjects.find(
          (subject) => subject.value === formValues.subject,
        )?.sequences ?? [])
      : [];

  return {
    schoolTypeValues,
    levelValues,
    subjectValues,
    sequenceValues,
  };
};
