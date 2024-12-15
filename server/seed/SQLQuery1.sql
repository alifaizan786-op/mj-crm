Use MalaniLive


SELECT 
    CSC1.Code,
    CSC1.CatSubCat,

    CSC2.Code AS CSC2_Code,
    CSC2.CatSubCat AS CSC2_CatSubCat,

    CSC3.Code AS CSC3_Code,
    CSC3.CatSubCat AS CSC3_CatSubCat,

    CONCAT(
        CASE WHEN CSC3.CatSubCat IS NOT NULL THEN CSC3.CatSubCat ELSE '' END,
        CASE WHEN CSC3.CatSubCat IS NOT NULL THEN ' > ' ELSE '' END,
        CASE WHEN CSC2.CatSubCat IS NOT NULL THEN CSC2.CatSubCat ELSE '' END,
        CASE WHEN CSC2.CatSubCat IS NOT NULL AND CSC1.CatSubCat IS NOT NULL THEN ' > ' ELSE '' END,
        COALESCE(CSC1.CatSubCat, '')
    ) AS Category_Hierarchy
FROM dbo.CatSubCats AS CSC1
LEFT JOIN dbo.CatSubCats AS CSC2
ON CSC1.ParentCode = CSC2.Code
LEFT JOIN dbo.CatSubCats AS CSC3
ON CSC2.ParentCode = CSC3.Code
ORDER BY Category_Hierarchy
