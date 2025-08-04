import { supabase } from '@/integrations/supabase/client';

interface ShippingRule {
  id: string;
  name: string;
  description?: string;
  rule_type: 'minimum_amount' | 'product_category' | 'product_specific';
  condition_value: string;
  is_active: boolean;
}

interface TaxRule {
  id: string;
  name: string;
  description?: string;
  tax_rate: number;
  applies_to: 'all' | 'category' | 'location';
  condition_value?: string;
  is_active: boolean;
}

class ShippingService {
  async getShippingRules(): Promise<ShippingRule[]> {
    const { data, error } = await supabase
      .from('shipping_rules')
      .select('*')
      .eq('is_active', true);
    
    if (error) {
      console.error('Error fetching shipping rules:', error);
      return [];
    }
    
    return (data || []).map(item => ({
      ...item,
      rule_type: item.rule_type as 'minimum_amount' | 'product_category' | 'product_specific'
    }));
  }

  async getTaxRules(): Promise<TaxRule[]> {
    const { data, error } = await supabase
      .from('tax_rules')
      .select('*')
      .eq('is_active', true);
    
    if (error) {
      console.error('Error fetching tax rules:', error);
      return [];
    }
    
    return (data || []).map(item => ({
      ...item,
      applies_to: item.applies_to as 'all' | 'category' | 'location'
    }));
  }

  async calculateShipping(orderAmount: number, items: any[]): Promise<number> {
    const rules = await this.getShippingRules();
    
    // Check minimum amount rules
    const minAmountRules = rules.filter(rule => rule.rule_type === 'minimum_amount');
    for (const rule of minAmountRules) {
      const minAmount = parseFloat(rule.condition_value);
      if (orderAmount >= minAmount) {
        return 0; // Free shipping
      }
    }
    
    // Check product category rules
    const categoryRules = rules.filter(rule => rule.rule_type === 'product_category');
    for (const rule of categoryRules) {
      const hasCategory = items.some(item => item.category === rule.condition_value);
      if (hasCategory) {
        return 0; // Free shipping
      }
    }
    
    // Check product specific rules
    const productRules = rules.filter(rule => rule.rule_type === 'product_specific');
    for (const rule of productRules) {
      const hasProduct = items.some(item => item.id === rule.condition_value);
      if (hasProduct) {
        return 0; // Free shipping
      }
    }
    
    // Default shipping rate
    return 9.99;
  }

  async calculateTax(orderAmount: number, customerLocation?: string): Promise<number> {
    const rules = await this.getTaxRules();
    
    if (rules.length === 0) {
      console.warn('No tax rules found, using default rate');
      return orderAmount * 0.08; // 8% default
    }
    
    // Check location-specific tax rules first
    if (customerLocation) {
      const locationRules = rules.filter(rule => 
        rule.applies_to === 'location' && 
        rule.condition_value?.toLowerCase() === customerLocation.toLowerCase()
      );
      if (locationRules.length > 0) {
        // Apply the first matching location rule
        return orderAmount * locationRules[0].tax_rate;
      }
    }
    
    // Check general tax rules
    const generalRules = rules.filter(rule => rule.applies_to === 'all');
    if (generalRules.length > 0) {
      // Sum up all general tax rates (e.g., VAT + Service Tax)
      const totalTaxRate = generalRules.reduce((sum, rule) => sum + rule.tax_rate, 0);
      return orderAmount * totalTaxRate;
    }
    
    // Check category-specific rules (if we have category info)
    const categoryRules = rules.filter(rule => rule.applies_to === 'category');
    if (categoryRules.length > 0) {
      // Use the first category rule as fallback
      return orderAmount * categoryRules[0].tax_rate;
    }
    
    // Fallback to default tax rate if no rules match
    console.warn('No applicable tax rules found, using default rate');
    return orderAmount * 0.08;
  }

  async getTaxBreakdown(totalTaxAmount: number): Promise<{ breakdown: Array<{name: string, amount: number, rate: number}>, singleTax: {name: string, amount: number} | null, rules: TaxRule[] }> {
    const rules = await this.getTaxRules();
    
    if (totalTaxAmount <= 0 || rules.length === 0) {
      return { breakdown: [], singleTax: null, rules };
    }

    // If only one tax rule, return it as a single tax
    if (rules.length === 1) {
      return {
        breakdown: [],
        singleTax: {
          name: rules[0].name,
          amount: totalTaxAmount
        },
        rules
      };
    }

    // Multiple tax rules - calculate proportional breakdown
    const totalRate = rules.reduce((sum, rule) => sum + rule.tax_rate, 0);
    
    if (totalRate === 0) {
      return { breakdown: [], singleTax: null, rules };
    }

    const breakdown = rules.map(rule => ({
      name: rule.name,
      amount: totalTaxAmount * (rule.tax_rate / totalRate),
      rate: rule.tax_rate
    }));

    return { breakdown, singleTax: null, rules };
  }
}

export const shippingService = new ShippingService();
export type { ShippingRule, TaxRule };
