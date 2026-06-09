'use client';
import React, { useState, useEffect, use, useRef, Suspense } from 'react';
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
import { useUnitAdmin } from '@/app/(admin)/hooks/useUnitAdmin';
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
 * Super Admin Zone: Handles medicine registry updates.
 * Fixed: Integrated homepage section linking logic within the update flow.
 * Design: Strictly rounded-none, industrial feel, business-friendly labels.
 */
export default function AdminEditProductPage({ params }) {
  const resolvedParams = use(params);
  const { slug } = resolvedParams;

  return (
    <AuthGuard allowedRoles={['SUPER_ADMIN']}>
      <Suspense
        fallback={
          <div className="p-20 font-mono uppercase animate-pulse text-black">
            Syncing Registry...
          </div>
        }
      >
        <EditProductContent slug={slug} />
      </Suspense>
    </AuthGuard>
  );
}

function EditProductContent({ slug }) {
  const router = useRouter();
  const {
    productDetails,
    fetchProductBySlug,
    updateProduct,
    isUpdating: hookIsUpdating,
    loading: productLoading,
    error: hookError,
  } = useProductAdmin();

  const { brands, getBrands } = useBrands();
  const { categories, getCategories } = useCategories();
  const { ingredients, fetchIngredients } = useIngredientAdmin();
  const { units, fetchUnits } = useUnitAdmin();

  // Internal processing state for sequential API orchestration
  const [isProcessing, setIsProcessing] = useState(false);
  const [localError, setLocalError] = useState(null);

  // 1. Core Form States
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
    is_featured_home: false, // Flag to trigger section linking
    unit: '',
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

  // Load necessary registry and metadata
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    getBrands(token, { page_size: 5000 });
    getCategories(token, { page_size: 5000 });
    fetchIngredients({ page_size: 5000 });
    fetchUnits({ page_size: 5000 });
    if (slug) fetchProductBySlug(slug);
  }, [
    slug,
    getBrands,
    getCategories,
    fetchIngredients,
    fetchUnits,
    fetchProductBySlug,
  ]);

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
        is_featured_home: productDetails.is_featured_home || false,
        unit: productDetails.unit || '',
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

      if (productDetails.specifications) {
        const parsedSpecs = Object.entries(productDetails.specifications).map(
          ([key, value]) => ({ key, value }),
        );
        setSpecs(
          parsedSpecs.length > 0 ? parsedSpecs : [{ key: '', value: '' }],
        );
      }

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

  // Handlers
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

  /**
   * handleSubmit
   * Logic: Updates Product -> Links/Unlinks Home Section -> Uploads New Gallery Images
   */
  const handleSubmit = async e => {
    e.preventDefault();
    setIsProcessing(true);
    setLocalError(null);

    const token = localStorage.getItem('access_token');
    const data = new FormData();

    // 1. Map fields to FormData
    Object.keys(formData).forEach(key => {
      if (key === 'dosages') {
        formData.dosages
          .split(',')
          .map(d => d.trim())
          .filter(Boolean)
          .forEach(v => data.append('dosages', v));
      } else if (key !== 'is_featured_home') {
        // Let the dedicated endpoint handle linking logic
        data.append(key, formData[key]);
      }
    });

    const specObj = {};
    specs.forEach(s => {
      if (s.key.trim()) specObj[s.key.trim()] = s.value;
    });
    data.append('specifications', JSON.stringify(specObj));

    const validFaqs = faqs.filter(f => f.question.trim());
    data.append('faq', JSON.stringify(validFaqs));

    if (newMainImage?.file) data.append('image', newMainImage.file);

    try {
      // Step A: Commit standard field changes
      const success = await updateProduct(slug, data);

      if (success) {
        // Step B: Link Product to Home Section (Main Category) if checked
        if (formData.is_featured_home && formData.category) {
          await productAdminApi.linkProductToCategory(token, slug, {
            category_id: parseInt(formData.category),
          });
        }

        // Step C: Upload any new gallery assets
        if (newGalleryImages.length > 0) {
          for (const img of newGalleryImages) {
            await productAdminApi.uploadGalleryImage(token, slug, img.file);
          }
        }
        router.push('/admin/products');
      }
    } catch (err) {
      console.error('Update failed:', err);
      setLocalError(
        err.detail ||
          (typeof err === 'object'
            ? JSON.stringify(err)
            : 'Failed to update registry.'),
      );
    } finally {
      setIsProcessing(false);
    }
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

  const activeUpdating = hookIsUpdating || isProcessing;
  const activeError = hookError || localError;

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500 pb-20 text-black">
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
              Registry Slug: {slug}
            </p>
          </div>
        </div>
        <button
          onClick={handleSubmit}
          disabled={activeUpdating}
          className="h-16 px-10 bg-[#3A5A40] text-white font-black uppercase tracking-[0.2em] text-sm flex items-center gap-4 hover:bg-black transition-all disabled:opacity-30 cursor-pointer rounded-none"
        >
          {activeUpdating ? (
            'COMMITTING...'
          ) : (
            <>
              <FiCheck size={20} /> UPDATE REGISTRY
            </>
          )}
        </button>
      </div>

      {/* Tab Controls */}
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

      {/* Main Tab Content Container */}
      <div className="bg-white border-2 border-gray-100 p-10 shadow-none">
        {activeTab === 'GENERAL' && (
          <BasicInfoTab
            formData={formData}
            handleInputChange={handleInputChange}
            brands={brands}
            categories={categories}
            ingredients={ingredients}
            units={units}
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

      {activeError && (
        <div className="p-6 bg-red-50 border-l-4 border-red-600 flex gap-4">
          <FiAlertCircle className="text-red-600 shrink-0" size={24} />
          <p className="text-xs font-black text-red-700 uppercase tracking-widest">
            Update Error:{' '}
            {typeof activeError === 'string'
              ? activeError
              : 'Registry update failed'}
          </p>
        </div>
      )}
    </div>
  );
}
