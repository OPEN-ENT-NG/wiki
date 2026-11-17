import {
  Button,
  Dropdown,
  Flex,
  FormControl,
  Grid,
  RadioCard,
  Select,
  TextArea,
  useEdificeClient,
} from '@edifice.io/react';
import { IconPlus } from '@edifice.io/react/icons';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useAIFormSequence } from './useAIFormSequence';
import { MAX_AI_SEQUENCE_THEME_LENGTH } from '~/config';
import { NumberStepper } from '~/components/NumberStepper/NumberStepper';
import './AIFormSequence.css';

const AIFormSequence = () => {
  const { control, sequences, formValues, register, handleSequenceTypeChange } =
    useAIFormSequence();

  const { appCode } = useEdificeClient();
  const { t } = useTranslation(appCode);

  return (
    <div className="ai-form-sequence">
      <h3 className="ai-form-sequence__title">
        {t('wiki.assistant.ai.form.sequence.title')}
      </h3>

      {/*
       * Choose Sequence Type Radio Cards:
       * - Dropdown "program"
       * - TextArea "theme"
       */}
      <Grid className="ai-form-sequenceType__radios">
        <Grid.Col sm="4" xl="6">
          {/* Program Radio Card */}
          <Controller
            name="sequenceType"
            control={control}
            rules={{ required: true }}
            render={({ field: { value, onChange } }) => (
              <RadioCard
                data-testid="ai-form-sequence-program-radio"
                label={t(
                  'wiki.assistant.ai.form.sequence.program.choose.label',
                )}
                value="program"
                description={t(
                  'wiki.assistant.ai.form.sequence.program.choose.description',
                )}
                groupName="sequenceType"
                selectedValue={value}
                onChange={(v) => {
                  onChange(v);
                  handleSequenceTypeChange(v);
                }}
              />
            )}
          />
        </Grid.Col>

        <Grid.Col sm="4" xl="6">
          {/* Theme Radio Card */}
          <Controller
            name="sequenceType"
            control={control}
            rules={{ required: true }}
            render={({ field: { value, onChange } }) => (
              <RadioCard
                data-testid="ai-form-sequence-theme-radio"
                label={t('wiki.assistant.ai.form.sequence.theme.choose.label')}
                value="theme"
                description={t(
                  'wiki.assistant.ai.form.sequence.theme.choose.description',
                )}
                groupName="sequenceType"
                selectedValue={value}
                onChange={(v) => {
                  onChange(v);
                  handleSequenceTypeChange(v);
                }}
              />
            )}
          />
        </Grid.Col>
      </Grid>

      {/* Sequence Program Dropdown */}
      {formValues.sequenceType === 'program' && (
        <Controller
          name="sequence"
          control={control}
          rules={{ required: true }}
          render={({ field: { value, onChange } }) => (
            <Dropdown block data-testid="ai-form-sequence-program-dropdown">
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
                    data-testid="ai-form-sequence-suggest-button"
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
            data-testid="ai-form-sequence-theme-textarea"
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

      {/* Seances */}
      <Grid className="ai-form-sequence-seances">
        <Grid.Col sm="4" xl="6">
          <label
            htmlFor="ai-form-sequence-session-count"
            className="ai-form-sequence-seances-nb-label"
          >
            {t('wiki.assistant.ai.form.sequence.seances.nb.label')}
          </label>
        </Grid.Col>
        <Grid.Col sm="4" xl="6">
          <span className="ai-form-sequence-seances-duration-label">
            {t('wiki.assistant.ai.form.sequence.seances.duration.label')}
          </span>
        </Grid.Col>
      </Grid>

      <Grid className="">
        <Grid.Col sm="4" xl="6">
          <Controller
            name="sessionCount"
            control={control}
            rules={{ required: true, min: 1 }}
            render={({ field }) => (
              <NumberStepper
                {...field}
                id="ai-form-sequence-session-count"
                min={1}
                decrementLabel={t(
                  'wiki.assistant.ai.form.sequence.seances.decrement',
                  {
                    defaultValue: 'Decrease session count',
                  },
                )}
                incrementLabel={t(
                  'wiki.assistant.ai.form.sequence.seances.increment',
                  {
                    defaultValue: 'Increase session count',
                  },
                )}
                formatValue={(count) =>
                  t('wiki.assistant.ai.form.sequence.seances.count', {
                    count,
                    defaultValue:
                      count === 1 ? '{{count}} session' : '{{count}} sessions',
                  })
                }
              />
            )}
          />
        </Grid.Col>
        <Grid.Col sm="4" xl="6">
          <Select
            block
            onValueChange={() => {}}
            options={['1 heure', '2 heures', '3 heures', '4 heures']}
            placeholderOption="Choose seances duration"
            selectedValue={'1 heure'}
          />
        </Grid.Col>
      </Grid>
    </div>
  );
};

export default AIFormSequence;
