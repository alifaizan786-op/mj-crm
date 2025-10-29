import {
  Box,
  FormControlLabel,
  Grid,
  MenuItem,
  Switch,
  TextField,
  Typography,
} from '@mui/material';

// Import your metafield definitions JSON
// import metafieldDefinitions from './metafield-definitions.json';

const MetafieldFormRenderer = ({
  metafieldDefinitions,
  formData,
  onFieldChange,
  ownerType = 'PRODUCT', // or 'PRODUCTVARIANT'
}) => {
  // Define field categories and their order
  const fieldCategories = {
    '': [
      'sku.classcode',
      'sku.vendor',
      'sku.vendorStyle',
      'sku.grossWeight',
      'sku.entryDate',
      'sku.dc',
      'sku.tag_price',
      'sku.per_gram_or_disc',
      'sku.uploadDate',
      'custom.number_of_pieces',
      'sku.metal_type',
      'sku.disclaimer',
    ],
    'Website Information': [
      'sku.category',
      'sku.sub_category',
      'sku.collection',
      'sku.jewelry_for',
      'sku.jewelry_type',
      'sku.gold_karat',
      'sku.color',
      'sku.finish',
      'sku.upload_date',
      'sku.customizable',
      'sku.price_fall',
      'sku.show_tag_price',
      'sku.hot_seller',
      'sku.new_arrival',
      'sku.close_out',
      'sku.autoUpdatePrice',
    ],
    'Jewelry Dimensions': [
      'sku.length',
      'sku.width',
      'sku.chain_length',
      'sku.chain_included_in_the_price',
      'sku.pendant_length',
      'sku.pendant_width',
      'sku.earrings_length',
      'sku.earrings_width',
      'sku.earring_post_type',
      'sku.ring_size',
      'sku.ring_design_height',
      'sku.ring_width',
      'sku.ring_type',
      'sku.bangle_size',
      'sku.bangle_bracelet_size_adjustable_up_to',
      'sku.bangle_inner_diameter',
      'sku.bangle_width',
      'sku.bangle_design_height',
      'sku.bangle_bracelet_type',
      'sku.nose_pin_type',
    ],
    'Diamond & Stone Information': [
      'sku.diamond_total_weight',
      'sku.center_diamond_weight',
      'sku.diamond_total_pcs',
      'sku.diamond_clarity',
      'sku.diamond_color',
      'sku.diamond_type',
      'sku.certification_type',
      'sku.certificate_1',
      'sku.certificate_2',
      'sku.certificate_3',
      'sku.certificate_4',
      'sku.certificate_5',
      'sku.gemstone_type',
      'sku.changeable_stones_included',
      'sku.gemstones_type',
      'sku.gemstones_weight',
    ],
    'Watch Information': [
      'sku.watch_condition',
      'sku.watch_bracelet_type',
      'sku.watch_case_size',
      'sku.watch_bezel_type',
      'custom.watch_papers_included',
      'sku.watch_disclaimer',
      '',
    ],
    'Misc Details': ['sku.view_count', 'sku.video_url'],
  };

  // Get the appropriate definitions based on owner type
  const definitions =
    ownerType === 'PRODUCT'
      ? metafieldDefinitions.data.productDefinitions.edges
      : metafieldDefinitions.data.variantDefinitions.edges;

  // Create a map of definitions by field key
  const definitionMap = definitions.reduce((acc, { node }) => {
    const fieldKey = `${node.namespace}.${node.key}`;
    acc[fieldKey] = node;
    return acc;
  }, {});

  // Organize definitions by category
  const organizedCategories = {};
  const usedFields = new Set();

  // First, categorize known fields
  Object.entries(fieldCategories).forEach(
    ([categoryName, fieldKeys]) => {
      const categoryFields = fieldKeys
        .map((fieldKey) => definitionMap[fieldKey])
        .filter(Boolean); // Remove undefined fields

      if (categoryFields.length > 0) {
        organizedCategories[categoryName] = categoryFields;
        fieldKeys.forEach((fieldKey) => {
          if (definitionMap[fieldKey]) {
            usedFields.add(fieldKey);
          }
        });
      }
    }
  );

  // Add remaining fields to "Additional Details"
  const remainingFields = Object.entries(definitionMap)
    .filter(([fieldKey]) => !usedFields.has(fieldKey))
    .map(([_, definition]) => definition);

  if (remainingFields.length > 0) {
    organizedCategories['Additional Details'] = remainingFields;
  }

  // Function to parse validation choices
  const parseChoices = (validations) => {
    const choicesValidation = validations.find(
      (v) => v.name === 'choices'
    );
    if (!choicesValidation) return null;

    try {
      return JSON.parse(choicesValidation.value);
    } catch (e) {
      console.error('Error parsing choices:', e);
      return null;
    }
  };

  // Function to get min/max validation values
  const getValidationValue = (validations, name) => {
    const validation = validations.find((v) => v.name === name);
    return validation ? validation.value : null;
  };

  // Function to render individual field based on type
  const renderField = (definition) => {
    const {
      id,
      name,
      namespace,
      key,
      type,
      description,
      validations,
    } = definition;
    const fieldKey = `${namespace}.${key}`;
    const fieldValue = formData[fieldKey] || '';

    const commonProps = {
      fullWidth: true,
      variant: 'outlined',
      size: 'small',
      label: name,
      value: fieldValue,
      onChange: (e) => onFieldChange(fieldKey, e.target.value),
    };

    // Handle different field types
    switch (type.category) {
      case 'TEXT':
        const choices = parseChoices(validations);

        if (choices && choices.length > 0) {
          // Render as dropdown for choices
          return (
            <TextField
              {...commonProps}
              select
              key={id}>
              <MenuItem value=''>
                <em>Select {name}</em>
              </MenuItem>
              {choices.map((choice) => (
                <MenuItem
                  key={choice}
                  value={choice}>
                  {choice}
                </MenuItem>
              ))}
            </TextField>
          );
        } else {
          // Render as text input
          return (
            <TextField
              {...commonProps}
              key={id}
              multiline={type.name === 'multi_line_text_field'}
              rows={type.name === 'multi_line_text_field' ? 3 : 1}
            />
          );
        }

      case 'NUMBER':
        const min = getValidationValue(validations, 'min');
        const max = getValidationValue(validations, 'max');

        return (
          <TextField
            {...commonProps}
            key={id}
            type='number'
            inputProps={{
              min: min ? parseFloat(min) : undefined,
              max: max ? parseFloat(max) : undefined,
              step: type.name === 'number_decimal' ? '0.01' : '1',
            }}
            onChange={(e) => {
              const value =
                e.target.value === ''
                  ? ''
                  : type.name === 'number_decimal'
                  ? parseFloat(e.target.value)
                  : parseInt(e.target.value);
              onFieldChange(fieldKey, value);
            }}
          />
        );

      case 'DATE_TIME':
        return (
          <TextField
            {...commonProps}
            key={id}
            type={type.name === 'date' ? 'date' : 'datetime-local'}
            InputLabelProps={{
              shrink: true,
            }}
          />
        );

      case 'TRUE_FALSE':
        return (
          <Box
            key={id}
            sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={
                    fieldValue === true || fieldValue === 'true'
                  }
                  onChange={(e) =>
                    onFieldChange(fieldKey, e.target.checked)
                  }
                />
              }
              label={name}
            />
            {description && (
              <Typography
                variant='caption'
                color='text.secondary'
                sx={{ ml: 1 }}>
                {description}
              </Typography>
            )}
          </Box>
        );

      case 'MEASUREMENT':
        return (
          <TextField
            {...commonProps}
            key={id}
            type='number'
            inputProps={{ step: '0.01' }}
            onChange={(e) => {
              const value =
                e.target.value === ''
                  ? ''
                  : parseFloat(e.target.value);
              onFieldChange(fieldKey, value);
            }}
          />
        );

      case 'MONEY':
        return (
          <TextField
            {...commonProps}
            key={id}
            type='number'
            inputProps={{ step: '0.01', min: '0' }}
            InputProps={{
              startAdornment: '$',
            }}
            onChange={(e) => {
              const value =
                e.target.value === ''
                  ? ''
                  : parseFloat(e.target.value);
              onFieldChange(fieldKey, value);
            }}
          />
        );

      case 'REFERENCE':
        // For now, render as text input. You might want to implement
        // a more sophisticated reference picker later
        return (
          <TextField
            {...commonProps}
            key={id}
            placeholder='Enter reference ID'
          />
        );

      default:
        console.warn(`Unsupported field type: ${type.category}`);
        return (
          <TextField
            {...commonProps}
            key={id}
            placeholder={`Unsupported type: ${type.category}`}
            disabled
          />
        );
    }
  };

  return Object.entries(organizedCategories).map(
    ([categoryName, categoryFields]) =>
      categoryName === '' ? (
        <Grid
          container
          spacing={2}
          sx={{ mt: 1, mb: 4 }}>
          {categoryFields.map((definition) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              key={definition.id}>
              {renderField(definition)}
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box
          key={categoryName}
          sx={{ mb: 4 }}>
          <Typography
            variant='h6'
            sx={{
              mb: 2,
              pb: 1,
              borderBottom: '2px solid #e0e0e0',
              color: 'primary.main',
              fontWeight: 600,
            }}>
            {categoryName}
          </Typography>
          <Grid
            container
            spacing={2}>
            {categoryFields.map((definition) => (
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                key={definition.id}>
                {renderField(definition)}
              </Grid>
            ))}
          </Grid>
        </Box>
      )
  );
};

export default MetafieldFormRenderer;
