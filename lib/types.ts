export type FieldType =
  | "welcome"
  | "short_text"
  | "long_text"
  | "email"
  | "phone"
  | "multiple_choice"
  | "thankyou";

export interface FieldOption {
  id: string;
  label: string;
}

export interface FormField {
  id: string;
  form_id: string;
  position: number;
  type: FieldType;
  title: string;
  description: string;
  required: boolean;
  options: FieldOption[];
  config: FieldConfig;
  created_at?: string;
}

export interface FieldConfig {
  buttonText?: string; // welcome / thankyou CTA
  redirectUrl?: string; // thankyou redirect
  placeholder?: string;
  multiple?: boolean; // multiple_choice: allow many
  imageUrl?: string;
}

export interface FormStyle {
  buttonColor?: string;
  questionColor?: string;
  answerColor?: string;
  backgroundColor?: string;
  backgroundImage?: string;
  logo?: string;
  font?: string;
  borderRadius?: number;
  language?: string;
}

export interface NotificationSettings {
  mode?: "all" | "complete" | "none";
  emailAlert?: boolean;
  alertEmail?: string;
  whatsappAlert?: boolean;
  whatsappNumber?: string;
  notifyRespondent?: boolean;
  forwardTo?: string;
}

export interface FormSettings {
  notifications?: NotificationSettings;
  removeBranding?: boolean;
  limitDuplicateFieldId?: string | null;
  block_new?: boolean;
  shareTitle?: string;
  shareDescription?: string;
}

export interface PixelConfig {
  pageViewOnLoad?: boolean;
  leadOnComplete?: boolean;
  leadEventName?: string; // default "Lead"
  perStepEvent?: boolean;
  perStepEventName?: string; // e.g. "ViewContent" or custom
  completeEventValue?: number;
}

export interface ConversionTrigger {
  type: "finish" | "field";
  fieldId?: string | null;
}

export interface DoitForm {
  id: string;
  user_id: string;
  title: string;
  slug: string;
  published: boolean;
  has_draft: boolean;
  style: FormStyle;
  settings: FormSettings;
  pixel_id: string | null;
  pixel_config: PixelConfig;
  ga_id: string | null;
  gtm_id: string | null;
  tiktok_pixel_id: string | null;
  conversion_trigger: ConversionTrigger;
  track_utm: boolean;
  append_utm_to_links: boolean;
  created_at: string;
  updated_at: string;
}

/** Account-level integration defaults (df_profiles). CAPI token is secret —
 * it is only ever read server-side by the df-capi edge function. */
export interface ProfileIntegrations {
  meta_pixel_id: string | null;
  meta_capi_token: string | null;
  ga_id: string | null;
  gtm_id: string | null;
  tiktok_pixel_id: string | null;
}

/** Non-secret effective tracking IDs returned by the df_public_tracking RPC. */
export interface PublicTracking {
  pixel_id?: string | null;
  ga_id?: string | null;
  gtm_id?: string | null;
  tiktok_pixel_id?: string | null;
}

export interface FormResponse {
  id: string;
  form_id: string;
  submission_id: string;
  completed: boolean;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  gclid: string | null;
  fbclid: string | null;
  fbp: string | null;
  fbc: string | null;
  referrer: string | null;
  user_agent: string | null;
  created_at: string;
  df_response_answers?: ResponseAnswer[];
}

export interface ResponseAnswer {
  id: string;
  response_id: string;
  field_id: string | null;
  question_label: string;
  field_type: string;
  value: string;
  created_at: string;
}

export const FIELD_TYPE_LABELS: Record<FieldType, string> = {
  welcome: "Boas-vindas",
  short_text: "Resposta curta",
  long_text: "Texto longo",
  email: "E-mail",
  phone: "Telefone",
  multiple_choice: "Múltipla escolha",
  thankyou: "Agradecimento",
};

export const DEFAULT_STYLE: FormStyle = {
  buttonColor: "#4F46E5",
  questionColor: "#263238",
  answerColor: "#2979FF",
  backgroundColor: "#ffffff",
  font: "Inter",
  borderRadius: 8,
  language: "pt",
};

export const DEFAULT_PIXEL_CONFIG: PixelConfig = {
  pageViewOnLoad: true,
  leadOnComplete: true,
  leadEventName: "Lead",
  perStepEvent: true,
  perStepEventName: "ViewContent",
};
