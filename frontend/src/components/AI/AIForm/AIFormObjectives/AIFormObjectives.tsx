import {
  Button,
  Dropdown,
  Flex,
  FormControl,
  Input,
  useEdificeClient,
} from '@edifice.io/react';
import { useTranslation } from 'react-i18next';
import { useAIFormObjectives } from './useAIFormObjectives';
import { Controller, useFieldArray } from 'react-hook-form';
import { MAX_AI_OBJECTIVE_LENGTH } from '~/config';
import { IconPlus, IconQuestion } from '@edifice.io/react/icons';
import './AIFormObjectives.css';

const AIFormObjectives = () => {
  const { control, objectives, register } = useAIFormObjectives();
  const { fields, append } = useFieldArray({ control, name: 'objectives' });

  const { appCode } = useEdificeClient();
  const { t } = useTranslation(appCode);

  return (
    <div className="ai-form-objectives">
      <h3 className="ai-form-objectives__title">
        {t(
          'wiki.assistant.ai.form.objectives.title',
          "Objectif d'apprentissage",
        )}
      </h3>
      <div className="ai-form-objectives__description">
        {t(
          'wiki.assistant.ai.form.objectives.description',
          "À la fin du cours, l'élève sera capable de...",
        )}
      </div>

      {fields.map((field, index) => (
        <Flex
          key={field.id}
          gap="8"
          direction="fill"
          className="ai-form-objectives__list"
        >
          <Controller
            name={`objectives.${index}.verb`}
            control={control}
            rules={{ required: true }}
            render={({ field: { value, onChange } }) => (
              <Dropdown>
                <Dropdown.Trigger
                  size="md"
                  label={
                    value ||
                    t(
                      'wiki.assistant.ai.form.objectives.dropdown.select',
                      '-- Choisir un objectif --',
                    )
                  }
                />
                <Dropdown.Menu role="listbox">
                  {objectives.map((objective) => (
                    <Dropdown.Item
                      key={objective}
                      type="action"
                      onClick={() => onChange(objective)}
                    >
                      {objective}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
            )}
          />
          <FormControl id={`objectiveText-${field.id}`}>
            <Input
              className="ai-form-objectives__input"
              maxLength={MAX_AI_OBJECTIVE_LENGTH}
              placeholder={t(
                'wiki.assistant.ai.form.objectives.input.placeholder',
                'Ex: La division cellulaire de la mitose et de la méiose',
              )}
              showCounter
              size="md"
              type="text"
              {...register(`objectives.${index}.text`, {
                required: true,
                maxLength: MAX_AI_OBJECTIVE_LENGTH,
              })}
            />
          </FormControl>
        </Flex>
      ))}

      {/* Add objective button */}
      <Button
        type="button"
        color="primary"
        variant="outline"
        rightIcon={<IconPlus />}
        size="md"
        className="ai-form-objectives__add"
        onClick={() => append({ verb: '', text: '' })}
      >
        {t('wiki.assistant.ai.form.objectives.add', 'Ajouter un objectif')}
      </Button>

      {/* Bloom Taxonomy */}
      <Flex gap="8" className="ai-form-objectives__bloom">
        <IconQuestion />
        <a href="https://bloom-1fc2a6.forge.apps.education.fr/" target="_blank">
          {t(
            'wiki.assistant.ai.form.objectives.bloom.link',
            'Taxonomie de Bloom',
          )}
        </a>
        -
        <span>
          {t(
            'wiki.assistant.ai.form.objectives.bloom.description',
            'Le verbe cadre le niveau de compétence visé.',
          )}
        </span>
      </Flex>
    </div>
  );
};

export default AIFormObjectives;
