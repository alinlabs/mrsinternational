import { useId } from 'react';
import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';

interface BidangDasarProps {
  label: string;
  id?: string;
  petunjuk?: string;
  galat?: string;
  wajib?: boolean;
  children: (atribut: {
    id: string;
    describedBy?: string;
    invalid: boolean;
  }) => ReactNode;
}

export function BidangFormulir({
  label,
  id,
  petunjuk,
  galat,
  wajib = false,
  children,
}: BidangDasarProps) {
  const idAcak = useId();
  const idAkhir = id ?? idAcak;
  const idPetunjuk = petunjuk ? `${idAkhir}-petunjuk` : undefined;
  const idGalat = galat ? `${idAkhir}-galat` : undefined;
  const describedBy = [idGalat, idPetunjuk].filter(Boolean).join(' ') || undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={idAkhir}
        className="text-xs font-medium text-[var(--teks-sekunder)]"
      >
        {label}
        {wajib && (
          <span className="ml-1 text-[var(--status-bahaya)]" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {children({ id: idAkhir, describedBy, invalid: Boolean(galat) })}
      {galat && (
        <p id={idGalat} role="alert" className="text-xs text-[var(--status-bahaya)]">
          {galat}
        </p>
      )}
      {!galat && petunjuk && (
        <p id={idPetunjuk} className="text-xs text-[var(--teks-redup)]">
          {petunjuk}
        </p>
      )}
    </div>
  );
}

const KELAS_KONTROL_DASAR =
  'w-full rounded-[var(--radius-sm)] border bg-[var(--bg-kanvas)] px-3 text-sm text-[var(--teks-utama)] placeholder:text-[var(--teks-redup)] transition-colors disabled:bg-[var(--bg-sekunder)] disabled:cursor-not-allowed';

export interface InputTeksProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: string;
  id?: string;
  petunjuk?: string;
  galat?: string;
  wajib?: boolean;
}

export function InputTeks({
  label,
  id,
  petunjuk,
  galat,
  wajib,
  className = '',
  ...props
}: InputTeksProps) {
  return (
    <BidangFormulir
      label={label}
      id={id}
      petunjuk={petunjuk}
      galat={galat}
      wajib={wajib}
    >
      {({ id: idField, describedBy, invalid }) => (
        <input
          id={idField}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          required={wajib}
          className={`h-9 ${KELAS_KONTROL_DASAR} ${
            invalid
              ? 'border-[var(--status-bahaya)]'
              : 'border-[var(--garis-tegas)] focus:border-[var(--aksen-maroon-garis)]'
          } ${className}`}
          {...props}
        />
      )}
    </BidangFormulir>
  );
}

export interface OpsiSelect {
  nilai: string;
  label: string;
}

export interface SelectPilihanProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'> {
  label: string;
  id?: string;
  opsi: OpsiSelect[];
  placeholderOpsi?: string;
  petunjuk?: string;
  galat?: string;
  wajib?: boolean;
}

export function SelectPilihan({
  label,
  id,
  opsi,
  placeholderOpsi,
  petunjuk,
  galat,
  wajib,
  className = '',
  ...props
}: SelectPilihanProps) {
  return (
    <BidangFormulir
      label={label}
      id={id}
      petunjuk={petunjuk}
      galat={galat}
      wajib={wajib}
    >
      {({ id: idField, describedBy, invalid }) => (
        <select
          id={idField}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          required={wajib}
          className={`h-9 ${KELAS_KONTROL_DASAR} ${
            invalid
              ? 'border-[var(--status-bahaya)]'
              : 'border-[var(--garis-tegas)] focus:border-[var(--aksen-maroon-garis)]'
          } ${className}`}
          {...props}
        >
          {placeholderOpsi && <option value="">{placeholderOpsi}</option>}
          {opsi.map((item) => (
            <option key={item.nilai} value={item.nilai}>
              {item.label}
            </option>
          ))}
        </select>
      )}
    </BidangFormulir>
  );
}

export interface AreaTeksProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> {
  label: string;
  id?: string;
  petunjuk?: string;
  galat?: string;
  wajib?: boolean;
}

export function AreaTeks({
  label,
  id,
  petunjuk,
  galat,
  wajib,
  className = '',
  rows = 3,
  ...props
}: AreaTeksProps) {
  return (
    <BidangFormulir
      label={label}
      id={id}
      petunjuk={petunjuk}
      galat={galat}
      wajib={wajib}
    >
      {({ id: idField, describedBy, invalid }) => (
        <textarea
          id={idField}
          rows={rows}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          required={wajib}
          className={`py-2 ${KELAS_KONTROL_DASAR} ${
            invalid
              ? 'border-[var(--status-bahaya)]'
              : 'border-[var(--garis-tegas)] focus:border-[var(--aksen-maroon-garis)]'
          } ${className}`}
          {...props}
        />
      )}
    </BidangFormulir>
  );
}
