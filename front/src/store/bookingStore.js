// src/store/bookingStore.js
import { create } from 'zustand';

const STEPS = ['service', 'vehicle', 'datetime', 'location', 'confirmation'];

const initialState = {
  currentStep: 'service',
  selectedService: null,
  selectedVehicleType: null,
  selectedDate: null,
  selectedTimeSlot: null,
  location: null,
  vehicleDetails: null,
  specialNotes: '',
};

export const useBookingStore = create((set, get) => ({
  ...initialState,

  // Set current step
  setStep: (step) => set({ currentStep: step }),

  // Go to next step
  nextStep: () => {
    const currentIndex = STEPS.indexOf(get().currentStep);
    if (currentIndex < STEPS.length - 1) {
      set({ currentStep: STEPS[currentIndex + 1] });
    }
  },

  // Go to previous step
  prevStep: () => {
    const currentIndex = STEPS.indexOf(get().currentStep);
    if (currentIndex > 0) {
      set({ currentStep: STEPS[currentIndex - 1] });
    }
  },

  // Get step index (0-based)
  getStepIndex: () => {
    return STEPS.indexOf(get().currentStep);
  },

  // Check if step is completed
  isStepCompleted: (step) => {
    const state = get();
    switch (step) {
      case 'service':
        return !!state.selectedService;
      case 'vehicle':
        return !!state.selectedVehicleType;
      case 'datetime':
        return !!state.selectedDate && !!state.selectedTimeSlot;
      case 'location':
        return !!state.location && !!state.vehicleDetails;
      default:
        return false;
    }
  },

  // Can proceed to next step
  canProceed: () => {
    const state = get();
    return state.isStepCompleted(state.currentStep);
  },

  // Set selected service
  setService: (service) => set({ 
    selectedService: service, 
    selectedVehicleType: null // Reset vehicle when service changes
  }),

  // Set selected vehicle type
  setVehicleType: (vehicleType) => set({ selectedVehicleType: vehicleType }),

  // Set selected date
  setDate: (date) => set({ 
    selectedDate: date, 
    selectedTimeSlot: null // Reset time slot when date changes
  }),

  // Set selected time slot
  setTimeSlot: (slot) => set({ selectedTimeSlot: slot }),

  // Set location
  setLocation: (location) => set({ location }),

  // Set vehicle details
  setVehicleDetails: (details) => set({ vehicleDetails: details }),

  // Set special notes
  setSpecialNotes: (notes) => set({ specialNotes: notes }),

  // Reset entire booking
  resetBooking: () => set(initialState),

  // Get booking data for API
  getBookingData: () => {
    const state = get();
    
    if (
      !state.selectedService ||
      !state.selectedVehicleType ||
      !state.selectedDate ||
      !state.selectedTimeSlot ||
      !state.location ||
      !state.vehicleDetails
    ) {
      return null;
    }

    // Format date as YYYY-MM-DD
    const formatDate = (date) => {
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    return {
      serviceId: state.selectedService._id,
      vehicleTypeId: state.selectedVehicleType._id,
      bookingDate: formatDate(state.selectedDate),
      timeSlot: state.selectedTimeSlot,
      location: state.location,
      vehicleDetails: state.vehicleDetails,
      specialNotes: state.specialNotes,
    };
  },

  // Get booking summary for display
  getBookingSummary: () => {
    const state = get();
    
    return {
      service: state.selectedService,
      vehicleType: state.selectedVehicleType,
      date: state.selectedDate,
      timeSlot: state.selectedTimeSlot,
      location: state.location,
      vehicleDetails: state.vehicleDetails,
      specialNotes: state.specialNotes,
      totalPrice: state.selectedVehicleType?.price || 0,
      duration: state.selectedVehicleType?.duration || 0,
    };
  },
}));