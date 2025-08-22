export const formatQtyWithConversion = (qty, unit, qtyBase, unitBase) => {
    if (!qty || !unit?.short) return "-";
  
    
    if (
      qtyBase &&
      unitBase?.short &&
      unitBase.short !== unit.short
    ) {
      return `${qtyBase} ${unitBase.short} (${qty} ${unit.short})`;
    }
  
    // default
    return `${qty} ${unit.short}`;
  };
  