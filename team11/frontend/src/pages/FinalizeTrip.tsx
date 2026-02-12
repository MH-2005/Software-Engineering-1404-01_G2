import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi } from '@/hooks/useApi';
import { tripApi } from '@/services/api';
import { getMockTrip } from '@/services/mockService';
import { Trip, TripItemWithDay } from '@/types/trip';
import Timeline from '@/components/Timeline';
import Button from '@/components/ui/Button';
import TripSummary from '@/containers/finalize-trip/TripSummery';

const FinalizeTrip: React.FC = () => {
    const { tripId } = useParams<{ tripId: string }>();
    const navigate = useNavigate();

    const [tripData, setTripData] = useState<Trip | null>(null);
    const { data, isLoading, error, request } = useApi(getMockTrip);

    useEffect(() => {
        if (tripId) {
            request(tripId);
        }
    }, [tripId]);

    useEffect(() => {
        if (data) {
            setTripData(data);
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
        <div className="container mx-auto px-4 py-8">

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

            <div className="flex gap-2 me-auto justify-between">
                <span className="font-bold text-green-600">
                    <i className="fa-solid fa-coins ml-1"></i>
                    {tripData.total_cost.toLocaleString('fa-IR')} تومان
                </span>
                <div className='flex gap-2'>
                    <Button
                        onClick={() => alert('ذخیره تغییرات')}
                        variant="primary"
                    >
                        <i className="fa-solid fa-save ml-2"></i>
                        ذخیره نهایی
                    </Button>
                </div>
            </div>
        </div >
    );
};

export default FinalizeTrip;
