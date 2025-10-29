import {
  // Add this
  Add, // Add this
  ArrowBack,
  CheckCircle,
  Save,
  Warning,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Fab,
  Grid,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MetafieldFormRenderer from '../../components/MetafieldFormRenderer';
import WebInvFetch from '../../fetch/WebInvFetch';
import Common from '../../layouts/common';
// Import your metafield definitions JSON
import metafieldDefinitions from './fields.json';

export default function SkuDetailPage() {
  const { sku } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [skuData, setSkuData] = useState(null);
  const [error, setError] = useState(null);

  // Simplified form state - now we'll use a single object for all metafields
  const [productForm, setProductForm] = useState({});
  const [variantForm, setVariantForm] = useState({});
  const [productMetafields, setProductMetafields] = useState({});
  const [variantMetafields, setVariantMetafields] = useState({});
  const [updating, setUpdating] = useState(false);

  // Load SKU details
  const loadSkuDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await WebInvFetch.getSkuDetails(sku);

      
      setSkuData(response.data);
    } catch (error) {
      console.error('Failed to load SKU details:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Add these states to track original values
  const [originalProductForm, setOriginalProductForm] = useState({});
  const [originalVariantForm, setOriginalVariantForm] = useState({});
  const [originalProductMetafields, setOriginalProductMetafields] =
    useState({});
  const [originalVariantMetafields, setOriginalVariantMetafields] =
    useState({});

  // Modified useEffect to store original values when data loads
  useEffect(() => {
    if (skuData) {
      const { product, currentVariant } = skuData;

      // Set basic product form and store original
      const productFormData = {
        title: product.title,
        vendor: product.vendor,
        productType: product.productType,
        status: product.status,
        description: product.description,
        tags: product.tags,
      };
      setProductForm(productFormData);
      setOriginalProductForm({ ...productFormData }); // Store copy of original

      // Set basic variant form and store original
      const variantFormData = {
        sku: currentVariant.sku,
        title: currentVariant.title,
        price: currentVariant.price,
        compareAtPrice: currentVariant.compareAtPrice,
        inventoryQuantity: currentVariant.inventoryQuantity,
        inventoryPolicy: currentVariant.inventoryPolicy,
        weight: currentVariant.weight,
        weightUnit: currentVariant.weightUnit,
        availableForSale: currentVariant.availableForSale,
      };
      setVariantForm(variantFormData);
      setOriginalVariantForm({ ...variantFormData }); // Store copy of original

      // Process metafields and store originals
      const flattenedProductMetafields = {};
      const flattenedVariantMetafields = {};

      // Your existing flattening logic...
      Object.entries(product.metafields || {}).forEach(
        ([key, fieldData]) => {
          const fieldKey = `sku.${key}`;
          let value = fieldData.value;

          // Your existing type conversion logic...
          if (
            fieldData.type === 'money' &&
            typeof value === 'string'
          ) {
            try {
              const moneyData = JSON.parse(value);
              value = parseFloat(moneyData.amount);
            } catch (e) {
              console.warn('Could not parse money value:', value);
            }
          }

          if (fieldData.type === 'boolean') {
            value = value === 'true' || value === true;
          }

          if (fieldData.type === 'number_integer') {
            value = parseInt(value) || 0;
          }

          if (fieldData.type === 'number_decimal') {
            value = parseFloat(value) || 0;
          }

          flattenedProductMetafields[fieldKey] = value;
        }
      );

      Object.entries(currentVariant.metafields || {}).forEach(
        ([key, fieldData]) => {
          const fieldKey = `${fieldData.namespace}.${key}`;
          let value = fieldData.value;

          // Same type conversion logic...
          if (
            fieldData.type === 'money' &&
            typeof value === 'string'
          ) {
            try {
              const moneyData = JSON.parse(value);
              value = parseFloat(moneyData.amount);
            } catch (e) {
              console.warn('Could not parse money value:', value);
            }
          }

          if (fieldData.type === 'boolean') {
            value = value === 'true' || value === true;
          }

          if (fieldData.type === 'number_integer') {
            value = parseInt(value) || 0;
          }

          if (fieldData.type === 'number_decimal') {
            value = parseFloat(value) || 0;
          }

          flattenedVariantMetafields[fieldKey] = value;
        }
      );

      setProductMetafields(flattenedProductMetafields);
      setVariantMetafields(flattenedVariantMetafields);
      setOriginalProductMetafields({ ...flattenedProductMetafields }); // Store copy
      setOriginalVariantMetafields({ ...flattenedVariantMetafields }); // Store copy
    }
  }, [skuData]);

  // Handle metafield changes
  const handleProductMetafieldChange = (fieldKey, value) => {
    setProductMetafields((prev) => ({
      ...prev,
      [fieldKey]: value,
    }));
  };

  const handleVariantMetafieldChange = (fieldKey, value) => {
    setVariantMetafields((prev) => ({
      ...prev,
      [fieldKey]: value,
    }));
  };

  // Handle form changes
  const handleProductFormChange = (field, value) => {
    setProductForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleVariantFormChange = (field, value) => {
    setVariantForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Updated handleUpdate function - only sends changed fields
  const handleUpdate = async () => {
    setUpdating(true);
    setError(null);

    try {
      // Helper function to get changed fields
      const getChangedFields = (original, current) => {
        const changes = {};
        Object.keys(current).forEach((key) => {
          if (
            JSON.stringify(original[key]) !==
            JSON.stringify(current[key])
          ) {
            changes[key] = {
              oldValue: original[key],
              newValue: current[key],
            };
          }
        });
        return changes;
      };

      // Helper function to get changed metafields
      const getChangedMetafields = (originalMeta, currentMeta) => {
        const changes = {};

        Object.keys(currentMeta).forEach((fieldKey) => {
          const originalValue = originalMeta[fieldKey];
          const currentValue = currentMeta[fieldKey];

          // Normalize values for comparison
          const normalizeValue = (val) => {
            if (val == null) return null;

            // Handle booleans (convert string booleans to actual booleans)
            if (val === 'true' || val === true) return true;
            if (val === 'false' || val === false) return false;

            // Handle numbers (convert string numbers to actual numbers)
            if (!isNaN(val) && val !== '' && val !== null) {
              return parseFloat(val);
            }

            // Handle strings
            return String(val);
          };

          const normalizedOriginal = normalizeValue(originalValue);
          const normalizedCurrent = normalizeValue(currentValue);

          // Compare normalized values
          const valuesEqual =
            normalizedOriginal === normalizedCurrent;

          if (!valuesEqual) {
            const [namespace, key] = fieldKey.split('.');
            if (!changes[namespace]) {
              changes[namespace] = {};
            }
            changes[namespace][key] = {
              oldValue: originalValue,
              newValue: currentValue,
            };
          }
        });

        return changes;
      };

      // Detect changes
      const productChanges = getChangedFields(
        originalProductForm,
        productForm
      );
      const variantChanges = getChangedFields(
        originalVariantForm,
        variantForm
      );
      const productMetafieldChanges = getChangedMetafields(
        originalProductMetafields,
        productMetafields
      );
      const variantMetafieldChanges = getChangedMetafields(
        originalVariantMetafields,
        variantMetafields
      );

      // Check if there are any changes
      const hasAnyChanges =
        Object.keys(productChanges).length > 0 ||
        Object.keys(variantChanges).length > 0 ||
        Object.keys(productMetafieldChanges).length > 0 ||
        Object.keys(variantMetafieldChanges).length > 0;

      if (!hasAnyChanges) {
        console.log('No changes detected');
        return;
      }

      // Prepare payload with only changed fields
      const updateData = {
        changes: {
          product: {
            fields: productChanges,
            metafields: productMetafieldChanges,
          },
          variant: {
            fields: variantChanges,
            metafields: variantMetafieldChanges,
          },
        },
        // Send full current data for business logic (pricing, etc.)
        currentData: {
          product: {
            ...productForm,
            metafields: (() => {
              const nested = {};
              Object.entries(productMetafields).forEach(
                ([fieldKey, value]) => {
                  const [namespace, key] = fieldKey.split('.');
                  if (!nested[namespace]) nested[namespace] = {};
                  nested[namespace][key] = value;
                }
              );
              return nested;
            })(),
          },
          variant: {
            ...variantForm,
            metafields: (() => {
              const nested = {};
              Object.entries(variantMetafields).forEach(
                ([fieldKey, value]) => {
                  const [namespace, key] = fieldKey.split('.');
                  if (!nested[namespace]) nested[namespace] = {};
                  nested[namespace][key] = value;
                }
              );
              return nested;
            })(),
          },
        },
      };

      const updatedSku = await WebInvFetch.updateSkuDetails(
        sku,
        updateData
      );

      // Reload data after update
      await loadSkuDetails();

      console.log('Update completed successfully');
    } catch (error) {
      console.error('Update failed:', error);
      setError(
        error.message || 'Failed to update SKU. Please try again.'
      );
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    if (sku) {
      loadSkuDetails();
    }
  }, [sku]);

  if (loading) {
    return (
      <Common>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '50vh',
          }}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>
            Loading SKU details...
          </Typography>
        </Box>
      </Common>
    );
  }

  if (error) {
    return (
      <Common>
        <Box sx={{ p: 2 }}>
          <Alert
            severity='error'
            sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Button
            variant='outlined'
            onClick={() => navigate('/web/inventory/skulisting')}>
            Back to SKU Listing
          </Button>
        </Box>
      </Common>
    );
  }

  const {
    localData,
    product,
    currentVariant,
    allVariants,
    recentChanges,
    dataComparison,
  } = skuData;

  // 2. Add the handleAddVariant and handleBack functions:
  const handleAddVariant = () => {
    console.log('Add variant clicked');
    // TODO: Implement add variant logic
    alert('Add Variant functionality - to be implemented');
  };

  const handleBack = () => {
    navigate('/web/inventory/skulisting');
  };

  return (
    <Common>
      <Box sx={{ p: 2, pb: 10 }}>
        {/* Data Sync Status */}
        <Alert
          severity={dataComparison.priceMatch ? 'success' : 'warning'}
          sx={{ mb: 3 }}
          icon={
            dataComparison.priceMatch ? <CheckCircle /> : <Warning />
          }
          action={
            dataComparison.priceMatch &&
            `Last synced: ${new Date(
              dataComparison.lastSynced
            ).toLocaleString()}`
          }>
          {dataComparison.priceMatch
            ? 'Local and Shopify prices are in sync'
            : `Price mismatch: Local $${dataComparison.localPrice?.toLocaleString()} vs Shopify $${dataComparison.shopifyPrice?.toLocaleString()}`}
        </Alert>

        <Grid
          container
          spacing={3}>
          {/* Main Content */}
          <Grid
            item
            xs={12}
            md={8}>
            {/* Basic Product Info */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography
                  variant='h6'
                  gutterBottom>
                  📦 Basic Product Info
                </Typography>
                <Grid
                  container
                  spacing={2}>
                  <Grid
                    item
                    xs={12}
                    sm={6}>
                    <TextField
                      label='Title'
                      value={productForm.title || ''}
                      onChange={(e) =>
                        handleProductFormChange(
                          'title',
                          e.target.value
                        )
                      }
                      fullWidth
                      variant='outlined'
                      size='small'
                    />
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    sm={6}>
                    <TextField
                      select
                      label='Status'
                      value={productForm.status || ''}
                      onChange={(e) =>
                        handleProductFormChange(
                          'status',
                          e.target.value
                        )
                      }
                      fullWidth
                      variant='outlined'
                      size='small'>
                      <MenuItem value='ACTIVE'>Active</MenuItem>
                      <MenuItem value='DRAFT'>Draft</MenuItem>
                      <MenuItem value='ARCHIVED'>Archived</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid
                    item
                    xs={12}>
                    <TextField
                      label='Description'
                      value={productForm.description || ''}
                      onChange={(e) =>
                        handleProductFormChange(
                          'description',
                          e.target.value
                        )
                      }
                      fullWidth
                      multiline
                      rows={3}
                      variant='outlined'
                      size='small'
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Basic Variant Info */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography
                  variant='h6'
                  gutterBottom>
                  🏷️ Basic Variant Info
                </Typography>
                <Grid
                  container
                  spacing={2}>
                  <Grid
                    item
                    xs={12}
                    sm={6}>
                    <TextField
                      label='SKU'
                      value={variantForm.sku || ''}
                      onChange={(e) =>
                        handleVariantFormChange('sku', e.target.value)
                      }
                      fullWidth
                      variant='outlined'
                      size='small'
                    />
                  </Grid>
                  {allVariants.length > 1 && (
                    <Grid
                      item
                      xs={12}
                      sm={6}>
                      <TextField
                        label='Variant Title'
                        value={variantForm.title || ''}
                        onChange={(e) =>
                          handleVariantFormChange(
                            'title',
                            e.target.value
                          )
                        }
                        fullWidth
                        variant='outlined'
                        size='small'
                      />
                    </Grid>
                  )}
                  <Grid
                    item
                    xs={12}
                    sm={6}>
                    <TextField
                      label='Price ($)'
                      type='number'
                      value={variantForm.price || ''}
                      onChange={(e) =>
                        handleVariantFormChange(
                          'price',
                          parseFloat(e.target.value)
                        )
                      }
                      fullWidth
                      variant='outlined'
                      size='small'
                    />
                  </Grid>
                </Grid>
                <MetafieldFormRenderer
                  metafieldDefinitions={metafieldDefinitions}
                  formData={productMetafields}
                  onFieldChange={handleProductMetafieldChange}
                  ownerType='PRODUCT'
                />
              </CardContent>
            </Card>

            {/* Dynamic Variant Metafields */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography
                  variant='h6'
                  gutterBottom>
                  🎯 Variant Metafields
                </Typography>
                <MetafieldFormRenderer
                  metafieldDefinitions={metafieldDefinitions}
                  formData={variantMetafields}
                  onFieldChange={handleVariantMetafieldChange}
                  ownerType='PRODUCTVARIANT'
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Sidebar */}
          <Grid
            item
            xs={12}
            md={4}>
            {/* Product Images */}
            {product.images?.length > 0 && (
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography
                    variant='h6'
                    gutterBottom>
                    🖼️ Product Images
                  </Typography>
                  <Grid
                    container
                    spacing={1}>
                    {product.images.map((image, index) => (
                      <Grid
                        item
                        xs={6}
                        key={image.id}>
                        <Box
                          component='img'
                          src={image.url}
                          alt={
                            image.altText ||
                            `Product image ${index + 1}`
                          }
                          sx={{
                            width: '100%',
                            height: 150,
                            objectFit: 'cover',
                            borderRadius: 1,
                            border: '1px solid #ddd',
                          }}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            )}

            {/* All Variants */}
            {allVariants.length > 1 && (
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography
                    variant='h6'
                    gutterBottom>
                    🔄 All Variants ({allVariants.length})
                  </Typography>
                  <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
                    {allVariants.map((variant) => (
                      <Card
                        key={variant.id}
                        sx={{ mb: 1 }}>
                        <CardContent
                          sx={{
                            backgroundColor: variant.isCurrentVariant
                              ? 'rgba(25, 118, 210, 0.08)'
                              : 'inherit',
                            p: 2,
                          }}>
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}>
                            <Box>
                              <Typography variant='body2'>
                                <strong>{variant.title}</strong>
                              </Typography>
                              <Typography
                                variant='caption'
                                color='text.secondary'>
                                SKU: {variant.sku}
                              </Typography>
                              <Typography variant='body2'>
                                ${variant.price?.toLocaleString()}
                              </Typography>
                            </Box>
                            <Box
                              sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 0.5,
                              }}>
                              <Chip
                                label={
                                  variant.availableForSale
                                    ? 'Available'
                                    : 'Unavailable'
                                }
                                color={
                                  variant.availableForSale
                                    ? 'success'
                                    : 'error'
                                }
                                size='small'
                              />
                              {variant.isCurrentVariant && (
                                <Chip
                                  label='Current'
                                  color='primary'
                                  size='small'
                                />
                              )}
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            )}
            {/* Recent Changes */}
            <Card>
              <CardContent>
                <Typography variant='h6'>
                  📝 Recent Changes ({recentChanges.length})
                </Typography>

                {recentChanges.length === 0 ? (
                  <Typography color='text.secondary'>
                    No recent changes found
                  </Typography>
                ) : (
                  <Box>
                    {recentChanges.map((change, index) => (
                      <Box
                        key={index}
                        sx={{
                          mb: 2,
                          p: 2,
                          border: '1px solid #eee',
                          borderRadius: 1,
                        }}>
                        <Typography
                          variant='body2'
                          color='text.secondary'
                          align='left'>
                          {new Date(
                            change.timestamp
                          ).toLocaleString()}{' '}
                          by {change.user}
                        </Typography>
                        {change.summary.split(',').map((part, i) => (
                          <Typography
                            variant='body1'
                            key={i}
                            align='left'>
                            {part.trim()}
                          </Typography>
                        ))}
                      </Box>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Floating Action Button for Save */}
        <Box
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
          }}>
          {/* Back FAB */}
          <Fab
            color='default'
            size='small'
            aria-label='back'
            onClick={handleBack}
            sx={{
              backgroundColor: 'grey.100',
              '&:hover': {
                backgroundColor: 'grey.200',
              },
            }}>
            <ArrowBack />
          </Fab>

          {/* Add Variant FAB */}
          <Fab
            color='secondary'
            size='medium'
            aria-label='add variant'
            onClick={handleAddVariant}
            disabled={updating}>
            <Add />
          </Fab>

          {/* Update/Save FAB */}
          <Fab
            color='primary'
            size='large'
            aria-label='save'
            onClick={handleUpdate}
            disabled={updating}>
            {updating ? (
              <CircularProgress
                size={24}
                color='inherit'
              />
            ) : (
              <Save />
            )}
          </Fab>
        </Box>
      </Box>
    </Common>
  );
}
