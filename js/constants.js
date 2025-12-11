export const THRESHOLDS = {
  "四象限基准线": {
    "保费达成率": 100,
    "变动成本率": 88,
    "满期赔付率": 70,
    "费用率": 14,
    "出险率": 11.5,
    "案均赔款": 4800
  },
  "问题机构识别阈值": {
    "年保费未达标": 95,
    "变动成本率超标": 93,
    "满期赔付率超标": 72,
    "费用率超标": 18
  }
};

export const YEAR_PLANS = {
  "年度保费计划": {
    "四川分公司": 431000000,
    "天府": 197300000,
    "武侯": 13500000,
    "高新": 55700000,
    "青羊": 43400000,
    "新都": 35000000,
    "德阳": 12800000,
    "宜宾": 22700000,
    "泸州": 10750000,
    "乐山": 11900000,
    "自贡": 9450000,
    "资阳": 12000000,
    "达州": 6500000,
    "本部": 1000000
  }
};

export const BUSINESS_TYPE_MAPPING = {
  "business_types": [
    {
      "ui_full_name": "非营业客车新车",
      "ui_short_label": "非营客-新",
      "code_identifier": "non_pc_new",
      "csv_field_name": "business_type_category",
      "csv_raw_value": "非营业客车新车",
      "category": "非营业客车",
      "is_canonical": true
    },
    {
      "ui_full_name": "非营业客车旧车非过户",
      "ui_short_label": "非营客-旧",
      "code_identifier": "non_pc_used",
      "csv_field_name": "business_type_category",
      "csv_raw_value": "非营业客车旧车非过户",
      "category": "非营业客车",
      "is_canonical": true
    },
    {
      "ui_full_name": "非营业客车旧车过户",
      "ui_short_label": "非营客-过户",
      "code_identifier": "non_pc_transfer",
      "csv_field_name": "business_type_category",
      "csv_raw_value": "非营业客车旧车过户",
      "category": "非营业客车",
      "is_canonical": true
    },
    {
      "ui_full_name": "1吨以下非营业货车",
      "ui_short_label": "非营货-<1t",
      "code_identifier": "non_truck_lt1",
      "csv_field_name": "business_type_category",
      "csv_raw_value": "1吨以下非营业货车",
      "category": "非营业货车",
      "is_canonical": true
    },
    {
      "ui_full_name": "1–2吨非营业货车",
      "ui_short_label": "非营货-1–2t",
      "code_identifier": "non_truck_1_2",
      "csv_field_name": "business_type_category",
      "csv_raw_value": "1–2吨非营业货车",
      "category": "非营业货车",
      "is_canonical": true
    },
    {
      "ui_full_name": "2吨以下营业货车",
      "ui_short_label": "营货-<2t",
      "code_identifier": "biz_truck_lt2",
      "csv_field_name": "business_type_category",
      "csv_raw_value": "2吨以下营业货车",
      "category": "营业货车",
      "is_canonical": true
    },
    {
      "ui_full_name": "2–9吨营业货车",
      "ui_short_label": "营货-2–9t",
      "code_identifier": "biz_truck_2_9",
      "csv_field_name": "business_type_category",
      "csv_raw_value": "2–9吨营业货车",
      "category": "营业货车",
      "is_canonical": true
    },
    {
      "ui_full_name": "9–10吨营业货车",
      "ui_short_label": "营货-9–10t",
      "code_identifier": "biz_truck_9_10",
      "csv_field_name": "business_type_category",
      "csv_raw_value": "9–10吨营业货车",
      "category": "营业货车",
      "is_canonical": true
    },
    {
      "ui_full_name": "10吨以上营业货车（普货）",
      "ui_short_label": "营货-≥10t普",
      "code_identifier": "biz_truck_10_plus",
      "csv_field_name": "business_type_category",
      "csv_raw_value": "10吨以上营业货车（普货）",
      "category": "营业货车",
      "is_canonical": true
    },
    {
      "ui_full_name": "10吨以上营业货车（牵引）",
      "ui_short_label": "营货-≥10t牵",
      "code_identifier": "biz_truck_10_plus_trac",
      "csv_field_name": "business_type_category",
      "csv_raw_value": "10吨以上营业货车（牵引）",
      "category": "营业货车",
      "is_canonical": true
    },
    {
      "ui_full_name": "自卸车",
      "ui_short_label": "营货-≥10t卸",
      "code_identifier": "biz_truck_10_plus_dump",
      "csv_field_name": "business_type_category",
      "csv_raw_value": "自卸车",
      "category": "营业货车",
      "is_canonical": true
    },
    {
      "ui_full_name": "特种车",
      "ui_short_label": "营货-≥10t特",
      "code_identifier": "biz_truck_10_plus_special",
      "csv_field_name": "business_type_category",
      "csv_raw_value": "特种车",
      "category": "营业货车",
      "is_canonical": true
    },
    {
      "ui_full_name": "其他营业货车",
      "ui_short_label": "营货-其他",
      "code_identifier": "biz_truck_other",
      "csv_field_name": "business_type_category",
      "csv_raw_value": "其他营业货车",
      "category": "营业货车",
      "is_canonical": true
    },
    {
      "ui_full_name": "摩托车",
      "ui_short_label": "摩托",
      "code_identifier": "motorcycle",
      "csv_field_name": "business_type_category",
      "csv_raw_value": "摩托车",
      "category": "其他",
      "is_canonical": true
    },
    {
      "ui_full_name": "出租车",
      "ui_short_label": "营客-出租",
      "code_identifier": "biz_pc_taxi",
      "csv_field_name": "business_type_category",
      "csv_raw_value": "出租车",
      "category": "营业客车",
      "is_canonical": true
    },
    {
      "ui_full_name": "网约车",
      "ui_short_label": "营客-网约",
      "code_identifier": "biz_pc_ridehailing",
      "csv_field_name": "business_type_category",
      "csv_raw_value": "网约车",
      "category": "营业客车",
      "is_canonical": true
    }
  ],
  "compatibility_mappings": [
    {
      "ui_full_name": "非营业客车旧车过户车",
      "ui_short_label": "非营客-过户",
      "code_identifier": "non_pc_transfer",
      "csv_field_name": "business_type_category",
      "csv_raw_value": "非营业客车旧车过户车",
      "maps_to": "非营业客车旧车过户",
      "note": "兼容旧文案"
    },
    {
      "ui_full_name": "非营业货车新车",
      "ui_short_label": "非营货-1–2t",
      "code_identifier": "non_truck_1_2",
      "csv_field_name": "business_type_category",
      "csv_raw_value": "非营业货车新车",
      "maps_to": "1–2吨非营业货车",
      "note": "兼容旧分类，暂映射到1–2t档"
    },
    {
      "ui_full_name": "非营业货车旧车",
      "ui_short_label": "非营货-1–2t",
      "code_identifier": "non_truck_1_2",
      "csv_field_name": "business_type_category",
      "csv_raw_value": "非营业货车旧车",
      "maps_to": "1–2吨非营业货车",
      "note": "兼容旧分类，暂映射到1–2t档"
    },
    {
      "ui_full_name": "2-9吨营业货车",
      "ui_short_label": "营货-2–9t",
      "code_identifier": "biz_truck_2_9",
      "csv_field_name": "business_type_category",
      "csv_raw_value": "2-9吨营业货车",
      "maps_to": "2–9吨营业货车",
      "note": "兼容不同连接符格式"
    },
    {
      "ui_full_name": "9-10吨营业货车",
      "ui_short_label": "营货-9–10t",
      "code_identifier": "biz_truck_9_10",
      "csv_field_name": "business_type_category",
      "csv_raw_value": "9-10吨营业货车",
      "maps_to": "9–10吨营业货车",
      "note": "兼容不同连接符格式"
    },
    {
      "ui_full_name": "10吨以上-普货",
      "ui_short_label": "营货-≥10t普",
      "code_identifier": "biz_truck_10_plus",
      "csv_field_name": "business_type_category",
      "csv_raw_value": "10吨以上-普货",
      "maps_to": "10吨以上营业货车（普货）",
      "note": "兼容简化格式"
    },
    {
      "ui_full_name": "10吨以上普货",
      "ui_short_label": "营货-≥10t普",
      "code_identifier": "biz_truck_10_plus",
      "csv_field_name": "business_type_category",
      "csv_raw_value": "10吨以上普货",
      "maps_to": "10吨以上营业货车（普货）",
      "note": "兼容简化格式"
    },
    {
      "ui_full_name": "10吨以上-牵引",
      "ui_short_label": "营货-≥10t牵",
      "code_identifier": "biz_truck_10_plus_trac",
      "csv_field_name": "business_type_category",
      "csv_raw_value": "10吨以上-牵引",
      "maps_to": "10吨以上营业货车（牵引）",
      "note": "兼容简化格式"
    },
    {
      "ui_full_name": "10吨以上牵引",
      "ui_short_label": "营货-≥10t牵",
      "code_identifier": "biz_truck_10_plus_trac",
      "csv_field_name": "business_type_category",
      "csv_raw_value": "10吨以上牵引",
      "maps_to": "10吨以上营业货车（牵引）",
      "note": "兼容简化格式"
    },
    {
      "ui_full_name": "自卸",
      "ui_short_label": "营货-≥10t卸",
      "code_identifier": "biz_truck_10_plus_dump",
      "csv_field_name": "business_type_category",
      "csv_raw_value": "自卸",
      "maps_to": "自卸车",
      "note": "兼容简化格式"
    },
    {
      "ui_full_name": "其他",
      "ui_short_label": "营货-其他",
      "code_identifier": "biz_truck_other",
      "csv_field_name": "business_type_category",
      "csv_raw_value": "其他",
      "maps_to": "其他营业货车",
      "note": "默认映射到其他营业货车"
    }
  ]
};
