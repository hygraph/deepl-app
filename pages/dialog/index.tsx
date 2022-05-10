import { useState, useEffect } from 'react';
import Image from 'next/image';

import {
    Wrapper,
    useUiExtensionDialog,
} from '@graphcms/app-sdk-react';

import { Box, Button, List, ListItem, Radio, RadioGroup, TextField } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const getProducts = async (params: any) => {
    const queryData = {
        keyword: params
    };
    // console.log('search data:', queryData);
    const request = await fetch('/api/get-products', {
        method: 'POST',
        body: JSON.stringify(params)
    });
    return request.json();
}

const Dialog = ({ products, setProducts }) => {
    const { onCloseDialog } = useUiExtensionDialog();
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState('');
    const [selectedProduct, setSelectedProduct] = useState();

    const handleSearch = (e: any) => {

        if (
            e.key !== 'Enter'
            && (e.target.localName !== 'button' && e.target.type !== 'click')
        ) {
            return;
        }

        setLoading(`Searching for "${search}"...`)

        getProducts(search)
            .then(response => {
                if(response.data.length > 0) {
                    setProducts(response.data);
                    setLoading('');
                } else {
                    setLoading('No products found! Try again!');
                }
            })
            .catch(error => console.log(error));
    };

    return (
        <>
            <Box>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '5px 10px'
                }}>
                    <h3>Select a product</h3>
                    <CloseModalButton closeModal={onCloseDialog} />
                </div>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '5px 10px'
                }}>
                    <div>
                        <TextField variant='outlined' size='small' value={search || ''} onChange={(e) => setSearch(e.target.value)} placeholder={`Type product name or SKU`} style={{ width: '50vw', marginRight: '5px' }} onKeyDown={handleSearch} />
                    </div>
                </div>
                <div>
                {loading === '' ? (
                    <ProductList products={products} onSelectedProduct={setSelectedProduct} />
                ) : (
                    <div style={{padding: '10px'}}>{loading}</div>
                )}
                </div>
                <div style={{
                    display: 'flex', 
                    justifyContent: 'end', 
                    padding: '10px', 
                    backgroundColor: '#f8f9fb'}}
                >
                    <Button variant='contained' size='small' onClick={() => onCloseDialog(selectedProduct)}>Add Product</Button>
                </div>
            </Box>
        </>
    );
};

function ProductList({ products, onSelectedProduct }) {

    const getProductData = (productId) => {
        return products.filter((product) => {
            if (productId == product.id) {
                return product;
            }
        })
    };

    const handleSelectedProduct = (e) => {
        const productData = getProductData(e.target.value)[0];
        onSelectedProduct(productData);
    }

    return (
        <Box sx={{ overflow: 'auto', maxHeight: '75vh' }}>
            <List>
                <RadioGroup name="products">
                    {products.map((product => {
                        const { primary_image } = product;
                        return (
                            <ListItem key={product.id}>
                                <Radio size='small' name='products' value={product.id} onChange={handleSelectedProduct} />
                                <Image src={primary_image.url_tiny} width={40} height={40} title={product.name} alt={product.name} />
                                <p>{product.name}</p>
                            </ListItem>
                        )
                    }))}
                </RadioGroup>
            </List>
        </Box >
    )
}

function CloseModalButton({ closeModal }) {
    return (
        <Button variant='text' size='small' onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            closeModal();
        }}
            onKeyPress={(event) => {
                event.preventDefault();
                event.stopPropagation();
                if (event.key === 'Enter') {
                    closeModal();
                }
            }}>
            <CloseIcon />
        </Button>
    );
}

const DialogExtension = () => {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        getProducts()
            .then(response => {
                setProducts(response.data);
            })
            .catch(error => console.log(error));
    }, [getProducts, setProducts]);

    return (
        <Wrapper>
            <Dialog products={products} setProducts={setProducts} />
        </Wrapper>
    );
};

export default DialogExtension;