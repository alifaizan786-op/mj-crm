import {
    Clear,
    Inventory,
    Refresh,
    Search,
    Star,
    StarBorder,
    TrendingUp,
} from '@mui/icons-material';
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Grid,
    InputAdornment,
    MenuItem,
    Pagination,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import WebInvFetch from '../../fetch/WebInvFetch';
import Common from '../../layouts/common';

export default function SkuListing() {
  const [skus, setSkus] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({});
  const [stats, setStats] = useState({});

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClasscode, setSelectedClasscode] = useState('');
  const [selectedVendor, setSelectedVendor] = useState('');
  const [selectedGoldKarat, setSelectedGoldKarat] = useState('');
  const [autoUpdateFilter, setAutoUpdateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('sku');
  const [sortOrder, setSortOrder] = useState('asc');

  // Load SKU listing
  const loadSkus = async () => {
    setLoading(true);
    try {
      const response = await WebInvFetch.getSkuListing({
        search: searchQuery,
        classcode: selectedClasscode,
        vendor: selectedVendor,
        gold_karat: selectedGoldKarat,
        autoUpdatePrice: autoUpdateFilter,
        page: currentPage,
        limit: 50,
        sortBy,
        sortOrder,
      });

      setSkus(response.data.skus);
      setPagination(response.data.pagination);
      setFilters(response.data.filters);
      setStats(response.data.stats);
    } catch (error) {
      console.error('Failed to load SKUs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedClasscode('');
    setSelectedVendor('');
    setSelectedGoldKarat('');
    setAutoUpdateFilter('');
    setCurrentPage(1);
  };

  // Handle sort change
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Load data on component mount and when filters change
  useEffect(() => {
    loadSkus();
  }, [
    searchQuery,
    selectedClasscode,
    selectedVendor,
    selectedGoldKarat,
    autoUpdateFilter,
    currentPage,
    sortBy,
    sortOrder,
  ]);

  return (
    <Common>
      <Box sx={{ p: 2 }}>
        <Typography
          variant='h4'
          gutterBottom
          sx={{ textAlign: 'center', mb: 3 }}>
          📦 SKU Listing
        </Typography>

        <Grid
          container
          spacing={2}
          sx={{ mb: 3 }}>
          <Grid
            item
            xs={12}
            sm={6}
            md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Inventory
                  sx={{ fontSize: 40, color: 'primary.main', mb: 1 }}
                />
                <Typography variant='h6'>
                  {stats.totalProducts?.toLocaleString() || 0}
                </Typography>
                <Typography
                  variant='body2'
                  color='text.secondary'>
                  Total Products
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid
            item
            xs={12}
            sm={6}
            md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <TrendingUp
                  sx={{ fontSize: 40, color: 'success.main', mb: 1 }}
                />
                <Typography variant='h6'>
                  {stats.autoUpdateEnabled?.toLocaleString() || 0}
                </Typography>
                <Typography
                  variant='body2'
                  color='text.secondary'>
                  Auto-Update Enabled
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid
            item
            xs={12}
            sm={6}
            md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Star
                  sx={{ fontSize: 40, color: 'warning.main', mb: 1 }}
                />
                <Typography variant='h6'>
                  {stats.withGoldKarat?.toLocaleString() || 0}
                </Typography>
                <Typography
                  variant='body2'
                  color='text.secondary'>
                  With Gold Karat
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid
            item
            xs={12}
            sm={6}
            md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <StarBorder
                  sx={{ fontSize: 40, color: 'grey.500', mb: 1 }}
                />
                <Typography variant='h6'>
                  {stats.withoutGoldKarat?.toLocaleString() || 0}
                </Typography>
                <Typography
                  variant='body2'
                  color='text.secondary'>
                  Without Gold Karat
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Paper sx={{ p: 2, mb: 3 }}>
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              flexWrap: 'wrap',
              alignItems: 'center',
            }}>
            <TextField
              placeholder='Search SKU, title, or vendor...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ minWidth: 300 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <Search />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              select
              label='Classcode'
              value={selectedClasscode}
              onChange={(e) => setSelectedClasscode(e.target.value)}
              sx={{ minWidth: 120 }}>
              <MenuItem value=''>All</MenuItem>
              {filters.classcodes?.map((code) => (
                <MenuItem
                  key={code}
                  value={code}>
                  {code}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label='Vendor'
              value={selectedVendor}
              onChange={(e) => setSelectedVendor(e.target.value)}
              sx={{ minWidth: 120 }}>
              <MenuItem value=''>All</MenuItem>
              {filters.vendors?.map((vendor) => (
                <MenuItem
                  key={vendor}
                  value={vendor}>
                  {vendor}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label='Gold Karat'
              value={selectedGoldKarat}
              onChange={(e) => setSelectedGoldKarat(e.target.value)}
              sx={{ minWidth: 120 }}>
              <MenuItem value=''>All</MenuItem>
              {filters.goldKarats?.map((karat) => (
                <MenuItem
                  key={karat}
                  value={karat}>
                  {karat}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label='Auto Update'
              value={autoUpdateFilter}
              onChange={(e) => setAutoUpdateFilter(e.target.value)}
              sx={{ minWidth: 120 }}>
              <MenuItem value=''>All</MenuItem>
              <MenuItem value='true'>Enabled</MenuItem>
              <MenuItem value='false'>Disabled</MenuItem>
            </TextField>

            <Button
              variant='outlined'
              startIcon={<Clear />}
              onClick={clearFilters}>
              Clear
            </Button>

            <Button
              variant='outlined'
              startIcon={<Refresh />}
              onClick={loadSkus}
              disabled={loading}>
              Refresh
            </Button>
          </Box>
        </Paper>

        <Box
          sx={{
            mb: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <Typography
            variant='body2'
            color='text.secondary'>
            Showing {pagination.showing || 0} of{' '}
            {pagination.totalCount || 0} SKUs
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip
              label={`Page ${pagination.currentPage || 1} of ${
                pagination.totalPages || 1
              }`}
              variant='outlined'
              size='small'
            />
          </Box>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{ cursor: 'pointer' }}
                  onClick={() => handleSort('sku')}>
                  SKU{' '}
                  {sortBy === 'sku' &&
                    (sortOrder === 'asc' ? '↑' : '↓')}
                </TableCell>
                <TableCell
                  sx={{ cursor: 'pointer' }}
                  onClick={() => handleSort('title')}>
                  Title{' '}
                  {sortBy === 'title' &&
                    (sortOrder === 'asc' ? '↑' : '↓')}
                </TableCell>
                <TableCell
                  sx={{ cursor: 'pointer' }}
                  onClick={() => handleSort('vendor')}>
                  Vendor{' '}
                  {sortBy === 'vendor' &&
                    (sortOrder === 'asc' ? '↑' : '↓')}
                </TableCell>
                <TableCell
                  sx={{ cursor: 'pointer' }}
                  onClick={() => handleSort('classcode')}>
                  Classcode{' '}
                  {sortBy === 'classcode' &&
                    (sortOrder === 'asc' ? '↑' : '↓')}
                </TableCell>
                <TableCell>Gold Karat</TableCell>
                <TableCell
                  sx={{ cursor: 'pointer' }}
                  onClick={() => handleSort('grossWeight')}>
                  Weight (g){' '}
                  {sortBy === 'grossWeight' &&
                    (sortOrder === 'asc' ? '↑' : '↓')}
                </TableCell>
                <TableCell
                  sx={{ cursor: 'pointer' }}
                  onClick={() => handleSort('currentPrice')}>
                  Current Price{' '}
                  {sortBy === 'currentPrice' &&
                    (sortOrder === 'asc' ? '↑' : '↓')}
                </TableCell>
                <TableCell>Auto Update</TableCell>
                <TableCell>Last Updated</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    sx={{ textAlign: 'center', py: 4 }}>
                    Loading SKUs...
                  </TableCell>
                </TableRow>
              ) : skus.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    sx={{ textAlign: 'center', py: 4 }}>
                    No SKUs found matching your criteria
                  </TableCell>
                </TableRow>
              ) : (
                skus.map((sku) => (
                  <TableRow
                    key={sku.sku}
                    hover>
                    <TableCell>
                      <Typography
                        variant='body2'
                        fontWeight='bold'>
                        {sku.sku}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant='body2'
                        sx={{ maxWidth: 200 }}
                        noWrap
                        title={sku.title}>
                        {sku.title}
                      </Typography>
                    </TableCell>
                    <TableCell>{sku.vendor || '-'}</TableCell>
                    <TableCell>{sku.classcode || '-'}</TableCell>
                    <TableCell>
                      {sku.gold_karat ? (
                        <Chip
                          label={sku.gold_karat}
                          size='small'
                          color='warning'
                        />
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>{sku.grossWeight || '-'}</TableCell>
                    <TableCell>
                      <Typography
                        variant='body2'
                        fontWeight='bold'>
                        ${sku.currentPrice?.toLocaleString() || '0'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={sku.autoUpdatePrice ? 'On' : 'Off'}
                        color={
                          sku.autoUpdatePrice ? 'success' : 'default'
                        }
                        size='small'
                      />
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant='body2'
                        color='text.secondary'>
                        {sku.updatedAt
                          ? new Date(
                              sku.updatedAt
                            ).toLocaleDateString()
                          : '-'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {pagination.totalPages > 1 && (
          <Box
            sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Pagination
              count={pagination.totalPages}
              page={currentPage}
              onChange={(e, page) => setCurrentPage(page)}
              color='primary'
              showFirstButton
              showLastButton
            />
          </Box>
        )}
      </Box>
    </Common>
  );
}
