import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi } from '@/hooks/useApi';
import { tripApi } from '@/services/api';
import { getMockTrip } from '@/services/mockService';
import { Trip, TripItemWithDay, BudgetLevel } from '@/types/trip';
import Timeline from '@/components/Timeline';
import Button from '@/components/ui/Button';
import TripSummary from '@/containers/finalize-trip/TripSummery';
import { BUDGET_LEVELS } from '@/containers/suggest-destination/constants';
import { calculateCategoryCosts, formatPersianCurrency } from '@/utils/costCalculations';

const FinalizeTrip: React.FC = () => {
    const { tripId } = useParams<{ tripId: string }>();
    const navigate = useNavigate();

    const [tripData, setTripData] = useState<Trip | null>(null);
    const [isEditingBudget, setIsEditingBudget] = useState(false);
    const [selectedBudget, setSelectedBudget] = useState<BudgetLevel>('MEDIUM');
    const { data, isLoading, error, request } = useApi(getMockTrip);

    useEffect(() => {
        if (tripId) {
            request(tripId);
        }
    }, [tripId]);

    useEffect(() => {
        if (data) {
            setTripData(data);
            setSelectedBudget(data.budget_level || 'MEDIUM');
        }
    }, [data]);

    const handleItemTimeChange = async (itemId: string, startTime: string, endTime: string) => {
        if (!tripId) return;

        try {
            await tripApi.updateItem(tripId, itemId, {
                start_time: startTime,
                end_time: endTime,
            });

            // Update local state
            setTripData((prev) => {
                if (!prev) return prev;
                return {
                    ...prev,
                    days: prev.days.map((day) => ({
                        ...day,
                        items: day.items.map((item) =>
                            item.id === itemId
                                ? { ...item, start_time: startTime, end_time: endTime }
                                : item
                        ),
                    })),
                };
            });
        } catch (err) {
            console.error('Failed to update item time:', err);
            alert('خطا در به‌روزرسانی زمان. لطفاً دوباره تلاش کنید.');
        }
    };

    const handleDeleteItem = async (itemId: string) => {
        if (!tripId) return;

        const confirmed = window.confirm('آیا از حذف این آیتم اطمینان دارید؟');
        if (!confirmed) return;

        try {
            await tripApi.deleteItem(tripId, itemId);

            // Update local state
            setTripData((prev) => {
                if (!prev) return prev;
                return {
                    ...prev,
                    days: prev.days.map((day) => ({
                        ...day,
                        items: day.items.filter((item) => item.id !== itemId),
                    })),
                };
            });
        } catch (err) {
            console.error('Failed to delete item:', err);
            alert('خطا در حذف آیتم. لطفاً دوباره تلاش کنید.');
        }
    };

    const handleSuggestAlternative = async (itemId: string) => {
        if (!tripId) return;

        try {
            const response = await tripApi.suggestAlternative(tripId, itemId);
            const alternativeItem = response.data;

            // Update local state with alternative item
            setTripData((prev) => {
                if (!prev) return prev;
                return {
                    ...prev,
                    days: prev.days.map((day) => ({
                        ...day,
                        items: day.items.map((item) =>
                            item.id === itemId ? alternativeItem : item
                        ),
                    })),
                };
            });

            alert('آیتم جایگزین با موفقیت پیشنهاد شد.');
        } catch (err) {
            console.error('Failed to suggest alternative:', err);
            alert('خطا در پیشنهاد آیتم جایگزین. لطفاً دوباره تلاش کنید.');
        }
    };

    // Combine all items from all days and separate by type
    const { visitItems, stayItems, totalDays } = useMemo(() => {
        if (!tripData) return { visitItems: [], stayItems: [], totalDays: 1 };

        const allItems: TripItemWithDay[] = [];
        tripData.days.forEach((day) => {
            day.items.forEach((item) => {
                allItems.push({
                    ...item,
                    day_number: day.day_number,
                    date: day.date,
                });
            });
        });

        // Sort by day_number first, then start_time to ensure values are in order for the slider
        const sortByDayAndTime = (a: TripItemWithDay, b: TripItemWithDay) => {
            if (a.day_number !== b.day_number) {
                return a.day_number - b.day_number;
            }
            return a.start_time.localeCompare(b.start_time);
        };

        return {
            visitItems: allItems.filter((item) => item.type === 'VISIT').sort(sortByDayAndTime),
            stayItems: allItems.filter((item) => item.type === 'STAY').sort(sortByDayAndTime),
            totalDays: tripData.duration_days,
        };
    }, [tripData]);

    // Calculate category costs for visualization
    const categoryCosts = useMemo(() => {
        if (!tripData) return [];
        return calculateCategoryCosts(tripData);
    }, [tripData]);

    const handleEditBudget = () => {
        setIsEditingBudget(true);
    };

    const handleCancelBudgetEdit = () => {
        setIsEditingBudget(false);
        setSelectedBudget(tripData?.budget_level || 'MEDIUM');
    };

    const handleSaveBudget = async () => {
        if (!tripId || !selectedBudget) return;

        try {
            await tripApi.updateTrip(tripId, { budget_level: selectedBudget });
            setTripData((prev) => {
                if (!prev) return prev;
                return { ...prev, budget_level: selectedBudget };
            });
            setIsEditingBudget(false);
            alert('سطح بودجه با موفقیت به‌روزرسانی شد.');
        } catch (err) {
            console.error('Failed to update budget level:', err);
            alert('خطا در به‌روزرسانی سطح بودجه.');
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">در حال بارگذاری...</p>
                </div>
            </div>
        );
    }

    if (error || !tripData) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <i className="fa-solid fa-exclamation-circle text-red-500 text-4xl mb-4"></i>
                    <p className="text-red-600 mb-4">{error || 'برنامه سفر یافت نشد'}</p>
                    <Button onClick={() => navigate('/')} variant="primary">
                        بازگشت به صفحه اصلی
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8">

            {/* Timelines */}
            <div className="mb-8">
                <div className="flex items-center justify-center mb-6 relative w-full">
                    <div className="section-header !mb-0 text-center">
                        <h3 className="text-3xl font-black text-text-dark">طرح پیشنهادی سفر</h3>
                    </div>
                    <div className="absolute right-0">
                        <Button variant="cancel" onClick={() => navigate(-1)} className="px-5 py-2 text-xs">
                            <i className="fa-solid fa-arrow-right ml-2 text-[10px]"></i>
                            بازگشت
                        </Button>
                    </div>
                </div>

                {/* Header */}
                <TripSummary
                    city={tripData.city}
                    province={tripData.province}
                    start_date={tripData.start_date}
                    end_date={tripData.end_date}
                    duration_days={tripData.duration_days}
                    style={tripData.style}
                    budget_level={tripData.budget_level}
                    density={tripData.density}
                />

                {/* VISIT Timeline */}
                {visitItems.length > 0 && (
                    <Timeline
                        title="برنامه بازدید"
                        items={visitItems}
                        totalDays={totalDays}
                        onItemTimeChange={handleItemTimeChange}
                        onDeleteItem={handleDeleteItem}
                        onSuggestAlternative={handleSuggestAlternative}
                        color="#276EF1"
                    />
                )}

                {/* STAY Timeline */}
                {stayItems.length > 0 && (
                    <Timeline
                        title="زمان‌بندی اقامت"
                        items={stayItems}
                        totalDays={totalDays}
                        onItemTimeChange={handleItemTimeChange}
                        onDeleteItem={handleDeleteItem}
                        onSuggestAlternative={handleSuggestAlternative}
                        color="#9333EA"
                    />
                )}

                {visitItems.length === 0 && stayItems.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        <i className="fa-solid fa-calendar-xmark text-4xl mb-4"></i>
                        <p>هنوز برنامه‌ای برای این سفر تعریف نشده است.</p>
                    </div>
                )}
            </div>

            <div className="flex gap-2 me-auto justify-between mb-12">
                {/* Budget Level and Cost Summary Section - split into two columns */}
                <div className="w-full bg-white rounded-lg shadow-md p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Left: Budget + Category Bars */}
                        <div className="md:w-3/4 w-full">
                            {/* Budget Level */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-lg font-bold text-gray-800">سطح بودجه:</h4>
                                    <div className="flex gap-2">
                                        {isEditingBudget ? (
                                            <>
                                                <Button
                                                    onClick={handleSaveBudget}
                                                    variant="primary"
                                                    className="px-4 py-1 text-sm"
                                                >
                                                    تغییر
                                                </Button>
                                                <Button
                                                    onClick={handleCancelBudgetEdit}
                                                    variant="cancel"
                                                    className="px-4 py-1 text-sm"
                                                >
                                                    انصراف
                                                </Button>
                                            </>
                                        ) : (
                                            <Button
                                                onClick={handleEditBudget}
                                                variant="secondary"
                                                className="px-4 py-1 text-sm"
                                            >
                                                <i className="fa-solid fa-edit ml-1"></i>
                                                (edit) تغییر
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                {/* Budget Level Options */}
                                <div className="flex gap-4 flex-wrap">
                                    {BUDGET_LEVELS.map((level) => (
                                        <label
                                            key={level.value}
                                            className={`flex items-center gap-2 cursor-pointer ${!isEditingBudget ? 'opacity-60 cursor-not-allowed' : ''}`}
                                        >
                                            <input
                                                type="radio"
                                                name="budget_level"
                                                value={level.value}
                                                checked={selectedBudget === level.value}
                                                onChange={(e) => setSelectedBudget(e.target.value as BudgetLevel)}
                                                disabled={!isEditingBudget}
                                                className="w-4 h-4"
                                            />
                                            <span className="text-sm text-gray-700">{level.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Category Cost Bars */}
                            <div className="space-y-4">
                                {categoryCosts.map((catCost) => (
                                    <div key={catCost.category}>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm font-semibold text-gray-700">
                                                {catCost.category}
                                            </span>
                                            <span className="text-sm text-gray-600">
                                                {formatPersianCurrency(catCost.totalCost)} تومان
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                            <div
                                                className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-300"
                                                style={{ width: `${catCost.percentage}%` }}
                                            ></div>
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            {catCost.percentage.toFixed(1)}٪
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right: Total + Save (separate column) */}
                        <div className="md:w-1/4 w-full flex flex-col items-center justify-center justify-end">
                            <div className="text-center mb-6">
                                <div className="text-sm text-gray-600 mb-2">مجموع تخمینی هزینه‌ها</div>
                                <div className="text-2xl font-extrabold text-green-600">
                                    {formatPersianCurrency(tripData.total_cost)} تومان
                                </div>
                            </div>

                            <div className="w-full">
                                <Button
                                    onClick={() => alert('ذخیره تغییرات')}
                                    variant="primary"
                                    className="w-full px-6 py-3"
                                >
                                    ذخیره نهایی
                                    <i className="fa-solid fa-save ml-2"></i>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default FinalizeTrip;
