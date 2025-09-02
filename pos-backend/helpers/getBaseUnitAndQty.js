async function getBaseUnitAndQty(unitId, qty, session) {
    const unitDoc = await Unit.findById(unitId).session(session);
    if (!unitDoc) return { unitBase: unitId, qtyBase: qty };
  
    if (!unitDoc.baseUnit) {
      return {
        unitBase: unitDoc._id,
        qtyBase: qty * (unitDoc.conversion || 1),
      };
    }
  
    return await getBaseUnitAndQty(
      unitDoc.baseUnit,
      qty * (unitDoc.conversion || 1),
      session
    );
  }
  