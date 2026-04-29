'use client';
import React, { useState, useRef, useEffect } from 'react';
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
import AuthGuard from '@/app/(shared)/components/AuthGuard';

// Modular Tab Imports
import BasicInfoTab from '../components/form-tabs/BasicInfoTab';
import StockPriceTab from '../components/form-tabs/StockPriceTab';
import MedicalGuideTab from '../components/form-tabs/MedicalGuideTab';
import AssetsTab from '../components/form-tabs/AssetsTab';
import AdvancedTab from '../components/form-tabs/AdvancedTab';

export default function AdminNewProductPage() {
  return (
    <AuthGuard allowedRoles={['SUPER_ADMIN']}>
      <NewProductContent />
    </AuthGuard>
  );
}

function NewProductContent() {
  const router = useRouter();
  const { createProductWithImages, isUpdating, error } = useProductAdmin();
  const { brands, getBrands } = useBrands();
  const { categories, getCategories } = useCategories();
  const { ingredients, fetchIngredients } = useIngredientAdmin();
  const { units, fetchUnits } = useUnitAdmin();

  // 1. Core Form State
  const [activeTab, setActiveTab] = useState('GENERAL');
  const [mainImage, setMainImage] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);

  // 2. Dynamic Builders State
  const [specs, setSpecs] = useState([{ key: '', value: '' }]);
  const [faqs, setFaqs] = useState([{ question: '', answer: '' }]); // FAQ State added here

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    brand: '',
    ingredient: '',
    dosages: '',
    price: '',
    original_price: '',
    quantity_in_stock: '',
    low_stock_threshold: '10',
    description: '',
    requires_prescription: false,
    is_active: true,
    is_generic: false,
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

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    getBrands(token);
    getCategories(token);
    fetchIngredients({ page_size: 200 });
    fetchUnits({ page_size: 200 });
  }, [getBrands, getCategories, fetchIngredients, fetchUnits]);

  // --- Handlers ---
  const handleInputChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Specification Handlers
  const addSpecField = () => setSpecs([...specs, { key: '', value: '' }]);
  const removeSpecField = i => setSpecs(specs.filter((_, idx) => idx !== i));
  const updateSpec = (i, field, val) => {
    const newSpecs = [...specs];
    newSpecs[i][field] = val;
    setSpecs(newSpecs);
  };

  // FAQ Handlers (Fixed: Now implemented in parent)
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

    // Serialize Standard Fields
    Object.keys(formData).forEach(key => {
      if (key === 'dosages') {
        formData.dosages
          .split(',')
          .map(d => d.trim())
          .filter(Boolean)
          .forEach(v => data.append('dosages', v));
      } else if (key === 'unit') {
        if (formData.unit) data.append('unit', formData.unit);
      } else {
        data.append(key, formData[key]);
      }
    });

    // Serialize Specifications (JSON)
    const specObj = {};
    specs.forEach(s => {
      if (s.key.trim()) specObj[s.key.trim()] = s.value;
    });
    data.append('specifications', JSON.stringify(specObj));

    // Serialize FAQs (JSON stringified into the single 'faq' string field)
    const validFaqs = faqs.filter(f => f.question.trim());
    data.append('faq', JSON.stringify(validFaqs));

    // Assets
    if (mainImage?.file) data.append('image', mainImage.file);
    const galleryFiles = galleryImages.map(img => img.file);

    const success = await createProductWithImages(data, galleryFiles);
    if (success) router.push('/admin/products');
  };

  const tabs = [
    { id: 'GENERAL', label: 'Basic Info', icon: <FiInfo /> },
    { id: 'PRICING', label: 'Stock & Price', icon: <FiHash /> },
    { id: 'MEDICAL', label: 'Medical Guide', icon: <FiActivity /> },
    { id: 'ASSETS', label: 'Photos', icon: <FiImage /> },
    { id: 'ADVANCED', label: 'Advanced', icon: <FiSettings /> },
  ];

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b-2 border-black pb-8">
        <div className="flex items-center gap-6">
          <button
            onClick={() => router.back()}
            className="p-4 bg-black text-white hover:bg-gray-800 transition-all cursor-pointer rounded-none"
          >
            <FiArrowLeft size={24} />
          </button>
          <h1 className="text-4xl font-black text-[#1B1B1B] tracking-tighter uppercase leading-none">
            New Medicine
          </h1>
        </div>
        <button
          onClick={handleSubmit}
          disabled={isUpdating}
          className="h-16 px-10 bg-[#3A5A40] text-white font-black uppercase tracking-[0.2em] text-sm flex items-center gap-4 hover:bg-black transition-all disabled:opacity-30 cursor-pointer rounded-none"
        >
          {isUpdating ? (
            'SAVING...'
          ) : (
            <>
              <FiCheck size={20} /> SAVE MEDICINE
            </>
          )}
        </button>
      </div>

      {/* Tab Switcher */}
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
            mainImage={mainImage}
            setMainImage={setMainImage}
            galleryImages={galleryImages}
            setGalleryImages={setGalleryImages}
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
            {error}
          </p>
        </div>
      )}
    </div>
  );
}
