import {
  Button,
  Dropdown,
  Flex,
  FormControl,
  Grid,
  TextArea,
  useEdificeClient,
} from '@edifice.io/react';
import { IconPlus } from '@edifice.io/react/icons';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useAIFormSequence } from './useAIFormSequence';
import SimpleRadioCard from '~/components/SimpleRadioCard/SimpleRadioCard';
import { MAX_AI_SEQUENCE_THEME_LENGTH } from '~/config';

const AIFormSequence = () => {
  const { control, sequences, formValues, register, handleSequenceTypeChange } =
    useAIFormSequence();

  const { appCode } = useEdificeClient();
  const { t } = useTranslation(appCode);

  return (
    <div className="ai-form-sequence">
      <h3 className="ai-form-sequence__title">
        {t('wiki.assistant.ai.step2.sequence')}
      </h3>

      {/*
       * Choose Sequence Type:
       * - Dropdown "program"
       * - TextArea "theme"
       */}
      <Grid className="ai-form-sequenceType__radios gap-8">
        <Grid.Col sm="8" md="8" lg="8" xl="12">
          <Flex gap="8">
            <Controller
              name="sequenceType"
              control={control}
              rules={{ required: true }}
              render={({ field: { value, onChange } }) => (
                <SimpleRadioCard
                  label="Choisir dans le programme"
                  value="program"
                  groupName="sequenceType"
                  selectedValue={value}
                  onChange={(v) => {
                    onChange(v);
                    handleSequenceTypeChange(v);
                  }}
                />
              )}
            />
            <Controller
              name="sequenceType"
              control={control}
              rules={{ required: true }}
              render={({ field: { value, onChange } }) => (
                <SimpleRadioCard
                  label="Décrire mon thème"
                  value="theme"
                  groupName="sequenceType"
                  selectedValue={value}
                  onChange={(v) => {
                    onChange(v);
                    handleSequenceTypeChange(v);
                  }}
                />
              )}
            />
          </Flex>
        </Grid.Col>
      </Grid>

      {/* Sequence Program Dropdown */}
      {formValues.sequenceType === 'program' && (
        <Controller
          name="sequence"
          control={control}
          rules={{ required: true }}
          render={({ field: { value, onChange } }) => (
            <Dropdown
              block
              data-testid="wiki.assistant.ai.step2.select.sequence"
            >
              <Dropdown.Trigger
                size="md"
                label={
                  <span className="text-truncate">
                    {value || t('wiki.assistant.ai.step2.select.sequence')}
                  </span>
                }
              />
              <Dropdown.Menu role="listbox">
                {sequences.map((sequence) => (
                  <Dropdown.Item
                    key={sequence}
                    type="action"
                    onClick={() => onChange(sequence)}
                  >
                    {sequence}
                  </Dropdown.Item>
                ))}
                <Flex justify="center" className="mt-8">
                  <Button
                    data-testid="suggest-sequence-cours-IA"
                    type="button"
                    color="secondary"
                    variant="outline"
                    style={{ width: '100%' }}
                    leftIcon={<IconPlus />}
                    onClick={() => {}}
                  >
                    {t('wiki.assistant.ai.step2.button.add.sequence')}
                  </Button>
                </Flex>
              </Dropdown.Menu>
            </Dropdown>
          )}
        />
      )}

      {formValues.sequenceType === 'theme' && (
        <FormControl id="ai-form-sequence-theme" isRequired>
          <TextArea
            data-testid="communities-create-input-description"
            placeholder={t(
              'wiki.assistant.ai.step2.sequence.theme.placeholder',
            )}
            size="md"
            maxLength={MAX_AI_SEQUENCE_THEME_LENGTH}
            {...register('sequence', {
              required: true,
              maxLength: MAX_AI_SEQUENCE_THEME_LENGTH,
            })}
            showCounter
          />
        </FormControl>
      )}

      <div>Sequence Type = {formValues.sequenceType}</div>
      <div>Sequence = {formValues.sequence}</div>
    </div>
  );
};

export default AIFormSequence;
