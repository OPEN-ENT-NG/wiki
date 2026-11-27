import {
  Button,
  Dropdown,
  Flex,
  FormControl,
  Grid,
  RadioCard,
  TextArea,
  useEdificeClient,
} from '@edifice.io/react';
import { IconPlus } from '@edifice.io/react/icons';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useAIFormSequenceField } from './useAIFormSequenceField';
import { MAX_AI_SEQUENCE_THEME_LENGTH } from '~/config';
import { NumberStepper } from '~/components/NumberStepper/NumberStepper';
import './AIFormSequenceField.css';

const AIFormSequenceField = () => {
  const { control, sequences, formValues, register, handleSequenceTypeChange } =
    useAIFormSequenceField();

  const { appCode } = useEdificeClient();
  const { t } = useTranslation(appCode);

  return (
    <div className="ai-form-sequence">
      <h3 className="ai-form-sequence__title">
        {t('wiki.assistant.ai.form.sequence.title', 'Séquence')}
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
              <Flex direction="column" fill>
                <RadioCard
                  data-testid="ai-form-sequence-program-radio"
                  label={t(
                    'wiki.assistant.ai.form.sequence.program.choose.label',
                    'Choisir dans le programme',
                  )}
                  value="program"
                  description={t(
                    'wiki.assistant.ai.form.sequence.program.choose.description',
                    'Diplôme • Module • Capacité',
                  )}
                  groupName="sequenceType"
                  selectedValue={value}
                  onChange={(v) => {
                    onChange(v);
                    handleSequenceTypeChange(v);
                  }}
                />
              </Flex>
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
              <Flex direction="column" fill>
                <RadioCard
                  data-testid="ai-form-sequence-theme-radio"
                  label={t(
                    'wiki.assistant.ai.form.sequence.theme.choose.label',
                    'Décrire mon thème',
                  )}
                  value="theme"
                  description={t(
                    'wiki.assistant.ai.form.sequence.theme.choose.description',
                    'Avec vos mots',
                  )}
                  groupName="sequenceType"
                  selectedValue={value}
                  onChange={(v) => {
                    onChange(v);
                    handleSequenceTypeChange(v);
                  }}
                />
              </Flex>
            )}
          />
        </Grid.Col>
      </Grid>

      {/* Sequence Program Dropdown */}
      {formValues.sequenceType === 'program' && (
        <Controller
          name="sequenceContentProgram"
          control={control}
          rules={{ required: true }}
          render={({ field: { value, onChange } }) => (
            <Dropdown block data-testid="ai-form-sequence-program-dropdown">
              <Dropdown.Trigger
                size="md"
                label={
                  value ||
                  t(
                    'wiki.assistant.ai.form.sequence.program.select',
                    '-- Choisir une séquence --',
                  )
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
                    {t(
                      'wiki.assistant.ai.form.sequence.program.button.add.sequence',
                      'Suggérer une séquence',
                    )}
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
              'wiki.assistant.ai.form.sequence.theme.placeholder',
              'Ex: La division cellulaire de la mitose et de la méiose',
            )}
            size="md"
            maxLength={MAX_AI_SEQUENCE_THEME_LENGTH}
            {...register('sequenceContentTheme', {
              required: true,
              maxLength: MAX_AI_SEQUENCE_THEME_LENGTH,
            })}
            showCounter
          />
        </FormControl>
      )}

      {/* Seances */}
      <Grid className="ai-form-sequence-seances__label">
        <Grid.Col sm="4" xl="6">
          <label
            htmlFor="ai-form-sequence-seances-count"
            className="ai-form-sequence-seances-nb-label"
          >
            {t(
              'wiki.assistant.ai.form.sequence.seances.nb.label',
              'Nombre de séances',
            )}
          </label>
        </Grid.Col>
        <Grid.Col sm="4" xl="6">
          <span className="ai-form-sequence-seances-duration-label">
            {t(
              'wiki.assistant.ai.form.sequence.seances.duration.label',
              'Durée des séances',
            )}
          </span>
        </Grid.Col>
      </Grid>

      <Grid className="">
        <Grid.Col sm="4" xl="6">
          {/* Seances number */}
          <Controller
            name="seancesCount"
            control={control}
            rules={{ required: true, min: 1, max: 10 }}
            render={({ field }) => (
              <NumberStepper
                {...field}
                id="ai-form-sequence-seances-count"
                min={1}
                max={10}
                decrementLabel={t(
                  'wiki.assistant.ai.form.sequence.seances.decrement',
                  'Diminuer',
                )}
                incrementLabel={t(
                  'wiki.assistant.ai.form.sequence.seances.increment',
                  'Augmenter',
                )}
                formatValue={(count) =>
                  count === 1
                    ? `${count} ${t('wiki.assistant.ai.form.sequence.seance', 'séance')}`
                    : `${count} ${t('wiki.assistant.ai.form.sequence.seances', 'séances')}`
                }
              />
            )}
          />
        </Grid.Col>
        <Grid.Col sm="4" xl="6">
          {/* Seances duration */}
          <Controller
            name="seancesDuration"
            control={control}
            rules={{ required: true, min: 1, max: 2 }}
            render={({ field }) => (
              <NumberStepper
                {...field}
                id="ai-form-sequence-seances-duration"
                min={1}
                max={2}
                decrementLabel={t(
                  'wiki.assistant.ai.form.sequence.seances.decrement',
                  'Diminuer',
                )}
                incrementLabel={t(
                  'wiki.assistant.ai.form.sequence.seances.increment',
                  'Augmenter',
                )}
                formatValue={(count) =>
                  `${count} ${t('wiki.assistant.ai.form.sequence.seances.duration', 'heure(s)')}`
                }
              />
            )}
          />
        </Grid.Col>
      </Grid>
    </div>
  );
};

export default AIFormSequenceField;
