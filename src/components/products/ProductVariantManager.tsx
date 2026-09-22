import React, { useState } from 'react';
import { Plus, Trash2, X, Tag } from 'lucide-react';
import { ProductVariant } from '../../types';
import { Button } from '../common/Button';
import { Input } from '../common/Input';

interface ProductVariantManagerProps {
  variants: ProductVariant[];
  onChange: (variants: ProductVariant[]) => void;
}

export const ProductVariantManager: React.FC<ProductVariantManagerProps> = ({
  variants,
  onChange,
}) => {
  const [variantName, setVariantName] = useState('');
  const [optionsInput, setOptionsInput] = useState('');

  const handleAddVariant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!variantName.trim() || !optionsInput.trim()) return;

    const options = optionsInput
      .split(',')
      .map((opt) => opt.trim())
      .filter((opt) => opt.length > 0);

    if (options.length === 0) return;

    const newVariant: ProductVariant = {
      id: `var-${Date.now()}`,
      name: variantName.trim(),
      options,
    };

    onChange([...variants, newVariant]);
    setVariantName('');
    setOptionsInput('');
  };

  const handleRemoveVariant = (id: string) => {
    onChange(variants.filter((v) => v.id !== id));
  };

  const handleRemoveOption = (variantId: string, optionToRemove: string) => {
    onChange(
      variants.map((v) => {
        if (v.id === variantId) {
          const updatedOptions = v.options.filter((opt) => opt !== optionToRemove);
          return { ...v, options: updatedOptions };
        }
        return v;
      })
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
          Product Variants (Sizes, Colors, Finishes)
        </label>
        <span className="text-[11px] text-zinc-500">
          {variants.length} variant group{variants.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Add Variant Form */}
      <div className="p-3.5 rounded-xl bg-[#101013] border border-zinc-800 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            placeholder="Variant Name (e.g. Metal Finish, Size)"
            value={variantName}
            onChange={(e) => setVariantName(e.target.value)}
            className="text-xs"
          />
          <Input
            placeholder="Options (comma separated, e.g. Gold, Rose Gold, Platinum)"
            value={optionsInput}
            onChange={(e) => setOptionsInput(e.target.value)}
            className="text-xs"
          />
        </div>
        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddVariant}
            disabled={!variantName.trim() || !optionsInput.trim()}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Add Variant Group
          </Button>
        </div>
      </div>

      {/* Display Existing Variants */}
      {variants.length > 0 && (
        <div className="space-y-2 pt-1">
          {variants.map((v) => (
            <div
              key={v.id}
              className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/80 flex items-start justify-between gap-3"
            >
              <div className="space-y-1.5 flex-1">
                <p className="text-xs font-semibold text-gold-light flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-gold-primary" />
                  <span>{v.name}</span>
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {v.options.map((opt) => (
                    <span
                      key={opt}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-black/60 border border-zinc-700/60 text-xs text-zinc-200"
                    >
                      {opt}
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(v.id, opt)}
                        className="text-zinc-400 hover:text-red-400 ml-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveVariant(v.id)}
                className="text-zinc-500 hover:text-red-400 p-1 rounded-lg hover:bg-zinc-800/60 transition-colors"
                title="Remove Variant"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
