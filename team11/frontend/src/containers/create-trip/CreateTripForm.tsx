import React, { useState } from 'react';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import ChipButton from '@/components/ui/ChipButton';
import TextField from '@/components/ui/TextField';
import { TRAVEL_STYLES, BUDGET_LEVELS, INITIAL_INTERESTS, PROGRAM_DENSITY } from '../suggest-destination/constants';
import { PROVINCES_DETAILS } from '@/constants';
import DatePicker from '@/components/ui/DatePicker';
import { useNavigate } from 'react-router';

const PROVINCES = Object.values(PROVINCES_DETAILS).map((prov) => ({ value: prov.province, label: prov.name }));

const CITIES: { value: string; label: string }[] = [];

const CreateTripForm = () => {
  const [formData, setFormData] = useState<{
    province: string | null;
    city: string | null;
    startDate: any | null; // Moment | null
    endDate: any | null; // Moment | null
    style: string | null;
    budget: string | null;
    density: string | null;
  }>({
    province: null,
    city: null,
    startDate: null,
    endDate: null,
    style: null,
    budget: null,
    density: null,
  });
  const [mode, setMode] = useState<'quick' | 'pro'>('quick');
  const [availableInterests, setAvailableInterests] = useState(INITIAL_INTERESTS);
  const [selectedInterestValues, setSelectedInterestValues] = useState<string[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newInterestLabel, setNewInterestLabel] = useState('');

  const navigate = useNavigate()

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value === '' ? null : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleRemoveAdvanced = () => {
    setFormData({...formData, style: null, budget: null, density: null,})
    setSelectedInterestValues([])
  }

  const toggleInterest = (value: string) => {
    setSelectedInterestValues(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    );
  };

  const handleConfirmAdd = () => {
    if (newInterestLabel.trim()) {
      const value = newInterestLabel.toLowerCase().replace(/\s+/g, '_');
      if (!availableInterests.find(i => i.value === value)) {
        setAvailableInterests([...availableInterests, { value, label: newInterestLabel }]);
        setSelectedInterestValues([...selectedInterestValues, value]);
      }
      setNewInterestLabel('');
      setIsAdding(false);
    }
  };

  const handleCreate = (mode: 'quick' | 'pro') => {
    let body = {...formData, interests: selectedInterestValues}
    if (mode === 'quick')
      body = {...body, interests: [], style: null, budget: null, density: null}
    
    body = {
      ...body,
      startDate: body.startDate?.format('YYYY-MM-DD'),
      endDate: body.endDate?.format('YYYY-MM-DD')
    }

    console.log(body)
  };

  const isFormValid = formData.province && formData.startDate;

  const isAdvancedShown = mode === 'pro'

  const hasAdvancedField = selectedInterestValues.length > 0 || formData.style || formData.budget || formData.density

  return (
    <div className="w-full max-w-5xl mx-auto p-10">
      {/* Header */}
      <div className="flex items-center justify-center mb-16 relative w-full">
                <div className="section-header !mb-0 text-center">
                    <h3 className="text-3xl font-black text-text-dark">ایجاد برنامه سفر</h3>
                </div>
                <div className="absolute right-0">
                    <Button variant="cancel" onClick={() => navigate('/')} className="px-5 py-2 text-xs">
                        <i className="fa-solid fa-arrow-right ml-2 text-[10px]"></i>
                        بازگشت
                    </Button>
                </div>
            </div>

      {/* Main Form */}
        {/* Select Grid - 4 items (province, city, start, end) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Select label="استان *" name="province" value={formData.province ?? ''} options={PROVINCES} onChange={handleSelectChange} required />
          <Select label="شهر / روستا" name="city" value={formData.city ?? ''} options={CITIES} onChange={handleSelectChange} />
          <DatePicker 
            label="تاریخ شروع سفر *" 
            value={formData.startDate} 
            onChange={(date) => {
              setFormData({ ...formData, startDate: date })
               if(formData?.endDate?.isBefore(date, 'day'))
                setFormData(prev => ({...prev, endDate: null}))
            }} 
          />
          <DatePicker 
            label="تاریخ پایان سفر" 
            value={formData.endDate} 
            onChange={(date) => {
              setFormData({ ...formData, endDate: date })
            }}
            disabledDates={(current) => {
              if (!formData.startDate) return false;
              return current?.isBefore(formData.startDate, 'day');
            }}
          />
        </div>

        {/* Personalization toggle (always visible). When opened show delete, interests and advanced selects */}
        <div className="flex items-center justify-start gap-6 mb-3">
          <span
            className="text-lg text-blue-600 cursor-pointer font-bold hover:underline"
            onClick={() => setMode(mode => mode === 'quick' ? 'pro' : 'quick')}
          >
            {isAdvancedShown ? 'بستن شخصی‌سازی بیشتر' : 'شخصی‌سازی بیشتر (علاقه، بودجه...)'}
            <i className={`fa-solid mr-2 ${isAdvancedShown ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
          </span>

          {isAdvancedShown && (
            <span onClick={handleRemoveAdvanced} className="text-lg text-gray-600 cursor-pointer">حذف شخصی‌سازی</span>
          )}
        </div>

        {/* When personalization is opened show interests and styled block */}
        {isAdvancedShown && (
          <div className="mb-6 bg-white/40 p-6 rounded-2xl border border-white/60">
            <h4 className="font-bold mb-6 text-right text-text-dark border-r-4 border-persian-gold pr-3">انتخاب علایق</h4>
            <div className="flex flex-wrap gap-3 justify-start items-center dir-rtl">
              {availableInterests.map((interest) => (
                <ChipButton
                  key={interest.value}
                  label={interest.label}
                  isSelected={selectedInterestValues.includes(interest.value)}
                  onClick={() => toggleInterest(interest.value)}
                />
              ))}
              {isAdding ? (
                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2">
                  <TextField
                    autoFocus
                    className="!p-2 rounded-xl border border-persian-gold bg-white text-sm outline-none w-32"
                    placeholder="عنوان..."
                    value={newInterestLabel}
                    onChange={(e) => setNewInterestLabel(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleConfirmAdd()}
                  />
                  <button onClick={handleConfirmAdd} className="text-leaf-green hover:scale-110 transition-transform">
                    <i className="fa-solid fa-circle-check text-xl"></i>
                  </button>
                  <button onClick={() => setIsAdding(false)} className="text-red-400 hover:scale-110 transition-transform">
                    <i className="fa-solid fa-circle-xmark text-xl"></i>
                  </button>
                </div>
              ) : (
                <Button variant="underline" onClick={() => setIsAdding(true)} className="text-xs font-bold mr-2">
                  افزودن علاقه جدید
                  <i className="fa-solid fa-plus-circle ml-1 no-underline"></i>
                </Button>
              )}
            </div>
          </div>
        )}


        {/* Advanced Section */}
        {isAdvancedShown && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 animate-in fade-in slide-in-from-top-2">
            <Select label="سبک سفر" name="style" value={formData.style ?? ''} options={TRAVEL_STYLES} onChange={handleSelectChange} />
            <Select label="سطح بودجه" name="budget" value={formData.budget ?? ''} options={BUDGET_LEVELS} onChange={handleSelectChange} />
            <Select label="تراکم برنامه‌ها" name="density" value={formData.density ?? ''} options={PROGRAM_DENSITY} onChange={handleSelectChange} />
          </div>
        )}

        {/* Action Buttons (left-aligned, mode-based: only one active CTA) */}
        <div className="mt-8" style={{ direction: 'ltr' }}>
          <div className="flex gap-4 items-start">
            {mode === 'quick' && <Button
              variant='cta'
              disabled={mode !== 'quick' || !isFormValid}
              className="w-56 py-4 text-lg rounded-xl"
              onClick={() => handleCreate('quick')}
            >
              ایجاد برنامه فوری
            </Button>}

           {mode === 'pro' && <Button
              variant='primary'
              disabled={mode !== 'pro' || !isFormValid || !hasAdvancedField}
              className="w-56 py-4 text-lg rounded-xl"
              onClick={() => handleCreate('pro')}
            >
              ایجاد برنامه حرفه‌ای
            </Button>}
          </div>
        </div>
    </div>
  );
};

export default CreateTripForm;
