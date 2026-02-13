// Auto-fill form script for Chamber of Commerce Certificate
// Copy and paste this script in your browser console when the form is open

(function() {
    console.log('🔄 Starting auto-fill...');
    
    // Helper function to set input value
    function setValue(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.value = value;
            console.log(`✓ Set ${id}`);
        } else {
            console.warn(`✗ Element not found: ${id}`);
        }
    }
    
    // Fill Exporter Information
    setValue('EXPORTER_COMPANY', 'Alliance international energy LLC');
    setValue('EXPORTER_ADDRESS', 'South Al Khuwair, Bousher, Muscat Governorate, 116');
    setValue('EXPORTER_POBOX', '283');
    setValue('EXPORTER_EMAIL', 'mohadahmed496@gmail.com');
    
    // Fill Importer Information
    setValue('IMPORTER_COMPANY', 'NOBLE ENERGY FZE');
    setValue('IMPORTER_ADDRESS', 'P2-HAMRIYAH BUSINESS CENTER, HAMRIYAH FREE ZONE, SHARJAH UAE');
    setValue('IMPORTER_POBOX', '283');
    setValue('IMPORTER_EMAIL', 'nobelenergy128@gmail.com');
    
    // Fill Certificate Details
    setValue('CERTIFICATE_NUMBER', 'F25111164554');
    setValue('CERTIFICATE_DATE', '2025-11-17');
    
    // Fill Invoice & Amount
    setValue('AMOUNT', '534300 USD');
    setValue('INVOICE_NO', 'NOB/002/11/2025');
    setValue('INVOICE_DATE', '2025-11-18');
    
    // Fill Destination
    setValue('DESTINATION_COUNTRY', 'United Arab Emirates');
    setValue('DESTINATION_COUNTRY_AR', 'الإمارات العربية المتحدة');
    
    // Fill Transport Details
    setValue('TRANSPORT_MEANS', 'sea');
    setValue('PORT_OF_DISCHARGE', 'HAMRIYAH');
    
    // Fill Weight & Comments
    setValue('TOTAL_WEIGHT', '1950 Ton');
    setValue('COMMENTS', '');
    
    // Add sample products
    console.log('\n📦 Adding products...');
    
    // Clear existing products first
    const container = document.getElementById('productsContainer');
    if (container) {
        container.innerHTML = '';
        
        // Reset product count if it exists
        if (typeof productCount !== 'undefined') {
            window.productCount = 0;
        }
    }
    
    // Add first product
    if (typeof addProduct === 'function') {
        addProduct();
        
        setTimeout(() => {
            const products = document.querySelectorAll('.product-item');
            if (products.length > 0) {
                const product1 = products[0];
                product1.querySelector('.product-marksNumbers').value = '271012399999';
                product1.querySelector('.product-description').value = 'GAS OIL';
                product1.querySelector('.product-originCountry').value = 'Iraq';
                product1.querySelector('.product-processingType').value = 'Processed In';
                product1.querySelector('.product-processingCountry').value = 'Oman';
                product1.querySelector('.product-quantity').value = '1950';
                product1.querySelector('.product-unit').value = 'Ton';
                console.log('✓ Product 1 filled');
            }
            
            console.log('\n✅ Auto-fill complete!');
            console.log('📝 Review the form and click "Create Document" when ready.');
        }, 100);
    } else {
        console.error('✗ addProduct function not found');
    }
    
})();
