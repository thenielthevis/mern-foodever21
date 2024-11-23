import React from 'react';
import { Button } from '@mui/material';

const CustomToolbarSelect = ({ handleBulkDeleteProducts }) => {
    return (
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
            <Button variant="contained" color="secondary" onClick={handleBulkDeleteProducts} style={{ marginLeft: '10px' }}>
                Bulk Delete
            </Button>
        </div>
    );
};

export default CustomToolbarSelect;