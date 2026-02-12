export interface DreamProfileFormData {
  dreamStatement: string;
  skillsOffered: string[];
  skillsNeeded: string[];
  location: {
    city: string;
    country: string;
  };
  bio: string;
  avatarFile: File | null;
  avatarPreview: string;
}

export const INITIAL_FORM_DATA: DreamProfileFormData = {
  dreamStatement: "",
  skillsOffered: [],
  skillsNeeded: [],
  location: {
    city: "",
    country: "",
  },
  bio: "",
  avatarFile: null,
  avatarPreview: "",
};

export const TOTAL_STEPS = 5;
