import { supabase } from '@/integrations/supabase/client';

interface ShippingRule {
  id: string;
  name: string;
  description?: string;
  rule_type: 'minimum_amount' | 'product_category' | 'product_specific';
  condition_value: string;
  shipping_rate: number;
  country: string;
  priority: number;
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

interface Country {
  id: string;
  name: string;
  code: string;
  currency: string;
  is_active: boolean;
}

class ShippingService {
  async getCountries(): Promise<Country[]> {
    const { data, error } = await supabase
      .from('countries')
      .select('*')
      .eq('is_active', true)
      .order('name');
    
    if (error) {
      console.error('Error fetching countries:', error);
      return [];
    }
    
    return data || [];
  }

  async getShippingRules(): Promise<ShippingRule[]> {
    const { data, error } = await supabase
      .from('shipping_rules')
      .select('*')
      .eq('is_active', true)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching shipping rules:', error);
      return [];
    }
    
    return (data || []).map(item => ({
      ...item,
      rule_type: item.rule_type as 'minimum_amount' | 'product_category' | 'product_specific',
      shipping_rate: Number(item.shipping_rate) || 0,
      priority: item.priority || 0,
      country: item.country || 'all'
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

  async calculateShipping(orderAmount: number, items: any[], customerCountry: string = 'all'): Promise<number> {
    const rules = await this.getShippingRules();
    
    // Filter rules by country (specific country rules take precedence over 'all')
    const countryRules = rules.filter(rule => 
      rule.country === customerCountry || rule.country === 'all'
    );
    
    // Sort by priority and country specificity
    const sortedRules = countryRules.sort((a, b) => {
      // Higher priority first
      if (a.priority !== b.priority) return b.priority - a.priority;
      // Country-specific rules before 'all' rules
      if (a.country !== b.country) {
        if (a.country === 'all') return 1;
        if (b.country === 'all') return -1;
      }
      return 0;
    });
    
    // Check rules in order of priority
    for (const rule of sortedRules) {
      let qualifies = false;
      
      switch (rule.rule_type) {
        case 'minimum_amount':
          const minAmount = parseFloat(rule.condition_value);
          qualifies = orderAmount >= minAmount;
          break;
          
        case 'product_category':
          qualifies = items.some(item => item.category === rule.condition_value);
          break;
          
        case 'product_specific':
          qualifies = items.some(item => item.id === rule.condition_value);
          break;
      }
      
      if (qualifies) {
        console.log(`Applied shipping rule: ${rule.name} - Rate: ${rule.shipping_rate}`);
        return rule.shipping_rate;
      }
    }
    
    // Default shipping rate if no rules match
    console.log('No shipping rules matched, using default rate');
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
export type { ShippingRule, TaxRule, Country };
