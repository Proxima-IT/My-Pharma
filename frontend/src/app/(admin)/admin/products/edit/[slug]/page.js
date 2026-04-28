'use client';
import React, { useState, useRef, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  FiArrowLeft,
  FiCheck,
  FiInfo,
  FiActivity,
  FiSettings,
  FiImage,
  FiHash,
  FiAlertCircle,
} from 'react-icons/fi';
import { useProductAdmin } from '@/app/(admin)/hooks/useProductAdmin';
import { useBrands } from '@/app/(pharmacy-owner)/hooks/useBrands';
import { useCategories } from '@/app/(pharmacy-owner)/hooks/useCategories';
import { useIngredientAdmin } from '@/app/(admin)/hooks/useIngredientAdmin';
import { getMediaUrl } from '@/app/(shared)/lib/apiConfig';
import { productAdminApi } from '@/app/(admin)/api/productAdminApi';
import AuthGuard from '@/app/(shared)/components/AuthGuard';

// Modular Tab Components
import BasicInfoTab from '../../components/form-tabs/BasicInfoTab';
import StockPriceTab from '../../components/form-tabs/StockPriceTab';
import MedicalGuideTab from '../../components/form-tabs/MedicalGuideTab';
import AssetsTab from '../../components/form-tabs/AssetsTab';
import AdvancedTab from '../../components/form-tabs/AdvancedTab';

/**
 * AdminEditProductPage
 * Modular Refactor: Uses centralized Tab components for medicine registry management.
 * Features: High-fidelity Markdown support, Dynamic Specification & FAQ builders.
 * Design: Strictly rounded-none, industrial contrast.
 */
export default function AdminEditProductPage({ params }) {
  const resolvedParams = use(params);
  const { slug } = resolvedParams;

  return (
    <AuthGuard allowedRoles={['SUPER_ADMIN']}>
      <EditProductContent slug={slug} />
    </AuthGuard>
  );
}

function EditProductContent({ slug }) {
  const router = useRouter();
  const {
    productDetails,
    fetchProductBySlug,
    updateProduct,
    isUpdating,
    loading: productLoading,
    error,
  } = useProductAdmin();

  const { brands, getBrands } = useBrands();
  const { categories, getCategories } = useCategories();
  const { ingredients, fetchIngredients } = useIngredientAdmin();

  // 1. Core Component States
  const [activeTab, setActiveTab] = useState('GENERAL');
  const [newMainImage, setNewMainImage] = useState(null);
  const [newGalleryImages, setNewGalleryImages] = useState([]);
  const [existingGallery, setExistingGallery] = useState([]);

  // 2. Dynamic Builder States
  const [specs, setSpecs] = useState([{ key: '', value: '' }]);
  const [faqs, setFaqs] = useState([{ question: '', answer: '' }]);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    brand: '',
    ingredient: '',
    dosages: '',
    price: '',
    original_price: '',
    quantity_in_stock: '',
    low_stock_threshold: '',
    description: '',
    requires_prescription: false,
    is_active: true,
    is_generic: false,
    indications: '',
    therapeutic_class: '',
    pharmacology: '',
    dosage_administration: '',
    interaction: '',
    contraindications: '',
    side_effects: '',
    pregnancy_lactation: '',
    precautions_warnings: '',
    overdose_effects: '',
    storage_conditions: '',
    mode_of_action: '',
    drug_classes: '',
    pregnancy: '',
    alternative_products: '',
  });

  // Load Registry Data
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    getBrands(token);
    getCategories(token);
    fetchIngredients({ page_size: 100 });
    if (slug) fetchProductBySlug(slug);
  }, [slug, getBrands, getCategories, fetchIngredients, fetchProductBySlug]);

  // Sync state with fetched product details
  useEffect(() => {
    if (productDetails) {
      setFormData({
        name: productDetails.name || '',
        category: productDetails.category || '',
        brand: productDetails.brand || '',
        ingredient: productDetails.ingredient || '',
        dosages: Array.isArray(productDetails.dosages)
          ? productDetails.dosages.join(', ')
          : '',
        price: productDetails.price || '',
        original_price: productDetails.original_price || '',
        quantity_in_stock: productDetails.quantity_in_stock || '',
        low_stock_threshold: productDetails.low_stock_threshold || '10',
        description: productDetails.description || '',
        requires_prescription: productDetails.requires_prescription || false,
        is_active: productDetails.is_active || true,
        is_generic: productDetails.is_generic || false,
        indications: productDetails.indications || '',
        therapeutic_class: productDetails.therapeutic_class || '',
        pharmacology: productDetails.pharmacology || '',
        dosage_administration: productDetails.dosage_administration || '',
        interaction: productDetails.interaction || '',
        contraindications: productDetails.contraindications || '',
        side_effects: productDetails.side_effects || '',
        pregnancy_lactation: productDetails.pregnancy_lactation || '',
        precautions_warnings: productDetails.precautions_warnings || '',
        overdose_effects: productDetails.overdose_effects || '',
        storage_conditions: productDetails.storage_conditions || '',
        mode_of_action: productDetails.mode_of_action || '',
        drug_classes: productDetails.drug_classes || '',
        pregnancy: productDetails.pregnancy || '',
        alternative_products: productDetails.alternative_products || '',
      });

      setExistingGallery(productDetails.images_data || []);

      // Parse Specifications
      if (productDetails.specifications) {
        const parsedSpecs = Object.entries(productDetails.specifications).map(
          ([key, value]) => ({ key, value }),
        );
        setSpecs(
          parsedSpecs.length > 0 ? parsedSpecs : [{ key: '', value: '' }],
        );
      }

      // Parse FAQ (Stored as JSON string in DB)
      if (productDetails.faq) {
        try {
          const parsedFaqs = JSON.parse(productDetails.faq);
          setFaqs(
            Array.isArray(parsedFaqs) && parsedFaqs.length > 0
              ? parsedFaqs
              : [{ question: '', answer: '' }],
          );
        } catch (e) {
          setFaqs([{ question: '', answer: '' }]);
        }
      }
    }
  }, [productDetails]);

  // --- Handlers ---
  const handleInputChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const deleteExistingImage = async imagePk => {
    if (confirm('Permanently remove this image from registry?')) {
      const token = localStorage.getItem('access_token');
      const ok = await productAdminApi.deleteGalleryImage(token, slug, imagePk);
      if (ok)
        setExistingGallery(prev => prev.filter(img => img.id !== imagePk));
    }
  };

  // Dynamic Builder Logic
  const addSpecField = () => setSpecs([...specs, { key: '', value: '' }]);
  const removeSpecField = i => setSpecs(specs.filter((_, idx) => idx !== i));
  const updateSpec = (i, field, val) => {
    const newSpecs = [...specs];
    newSpecs[i][field] = val;
    setSpecs(newSpecs);
  };

  const addFaqField = () => setFaqs([...faqs, { question: '', answer: '' }]);
  const removeFaqField = i => setFaqs(faqs.filter((_, idx) => idx !== i));
  const updateFaq = (i, field, val) => {
    const newFaqs = [...faqs];
    newFaqs[i][field] = val;
    setFaqs(newFaqs);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const data = new FormData();

    // 1. Serialize Standard Fields
    Object.keys(formData).forEach(key => {
      if (key === 'dosages') {
        formData.dosages
          .split(',')
          .map(d => d.trim())
          .filter(Boolean)
          .forEach(v => data.append('dosages', v));
      } else if (formData[key] !== '' && formData[key] !== null) {
        data.append(key, formData[key]);
      }
    });

    // 2. Serialize Specifications
    const specObj = {};
    specs.forEach(s => {
      if (s.key.trim()) specObj[s.key.trim()] = s.value;
    });
    data.append('specifications', JSON.stringify(specObj));

    // 3. Serialize FAQs
    const validFaqs = faqs.filter(f => f.question.trim());
    data.append('faq', JSON.stringify(validFaqs));

    if (newMainImage?.file) data.append('image', newMainImage.file);

    const success = await updateProduct(slug, data);

    // 4. Handle New Gallery Uploads
    if (success && newGalleryImages.length > 0) {
      const token = localStorage.getItem('access_token');
      for (const img of newGalleryImages) {
        await productAdminApi.uploadGalleryImage(token, slug, img.file);
      }
    }

    if (success) router.push('/admin/products');
  };

  if (productLoading && !productDetails) {
    return (
      <div className="flex items-center justify-center py-40">
        <div className="w-10 h-10 border-4 border-black border-t-transparent animate-spin rounded-none" />
      </div>
    );
  }

  const tabs = [
    { id: 'GENERAL', label: 'Identity', icon: <FiInfo /> },
    { id: 'PRICING', label: 'Inventory', icon: <FiHash /> },
    { id: 'MEDICAL', label: 'Medical', icon: <FiActivity /> },
    { id: 'ASSETS', label: 'Gallery', icon: <FiImage /> },
    { id: 'ADVANCED', label: 'Structure', icon: <FiSettings /> },
  ];

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b-2 border-black pb-8">
        <div className="flex items-center gap-6">
          <button
            onClick={() => router.back()}
            className="p-4 bg-black text-white hover:bg-gray-800 transition-all cursor-pointer rounded-none"
          >
            <FiArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-4xl font-black text-[#1B1B1B] tracking-tighter uppercase leading-none">
              Edit Medicine
            </h1>
            <p className="text-[10px] font-mono font-bold text-gray-400 mt-2 uppercase tracking-widest">
              Registry_Slug: {slug}
            </p>
          </div>
        </div>
        <button
          onClick={handleSubmit}
          disabled={isUpdating}
          className="h-16 px-10 bg-[#3A5A40] text-white font-black uppercase tracking-[0.2em] text-sm flex items-center gap-4 hover:bg-black transition-all disabled:opacity-30 cursor-pointer rounded-none shadow-none border-none"
        >
          {isUpdating ? (
            'COMMITTING_CHANGES...'
          ) : (
            <>
              <FiCheck size={20} /> UPDATE REGISTRY
            </>
          )}
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap bg-gray-50 p-1 border border-gray-100">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-3 px-8 py-4 text-[11px] font-bold uppercase tracking-widest transition-all cursor-pointer rounded-none ${activeTab === tab.id ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-black'}`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white border-2 border-gray-100 p-10 shadow-none">
        {activeTab === 'GENERAL' && (
          <BasicInfoTab
            formData={formData}
            handleInputChange={handleInputChange}
            brands={brands}
            categories={categories}
            ingredients={ingredients}
          />
        )}
        {activeTab === 'PRICING' && (
          <StockPriceTab
            formData={formData}
            handleInputChange={handleInputChange}
          />
        )}
        {activeTab === 'MEDICAL' && (
          <MedicalGuideTab
            formData={formData}
            handleInputChange={handleInputChange}
          />
        )}
        {activeTab === 'ASSETS' && (
          <AssetsTab
            mainImage={newMainImage}
            setMainImage={setNewMainImage}
            galleryImages={newGalleryImages}
            setGalleryImages={setNewGalleryImages}
            existingGallery={existingGallery}
            onDeleteExisting={deleteExistingImage}
            isEdit={true}
            currentMainImage={productDetails?.image}
          />
        )}
        {activeTab === 'ADVANCED' && (
          <AdvancedTab
            formData={formData}
            handleInputChange={handleInputChange}
            specs={specs}
            addSpecField={addSpecField}
            removeSpecField={removeSpecField}
            updateSpec={updateSpec}
            faqs={faqs}
            addFaqField={addFaqField}
            removeFaqField={removeFaqField}
            updateFaq={updateFaq}
          />
        )}
      </div>

      {error && (
        <div className="p-6 bg-red-50 border-l-4 border-red-600 flex gap-4">
          <FiAlertCircle className="text-red-600 shrink-0" size={24} />
          <p className="text-xs font-black text-red-700 uppercase tracking-widest">
            Update_Error:{' '}
            {typeof error === 'string' ? error : 'Validation failed'}
          </p>
        </div>
      )}
    </div>
  );
}
