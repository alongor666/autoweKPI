import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import KPIDashboard from '../report/KPIDashboard.vue'
import type { KPIResult } from '@/types/kpi'

// Mock ECharts to prevent canvas errors
vi.mock('echarts', () => ({
  init: vi.fn(() => ({
    setOption: vi.fn(),
    resize: vi.fn(),
    dispose: vi.fn()
  })),
  graphic: {
    LinearGradient: vi.fn()
  }
}))

const mockKPIData: KPIResult = {
  签单保费: 1000,
  满期保费: 800,
  已赚保费: 800,
  已报案赔付: 400,
  费用额: 200,
  保单件数: 100,
  赔案件数: 20,
  满期赔付率: 50,
  变动成本率: 75,
  综合成本率: 75,
  费用率: 25,
  贡献率: 25,
  满期边际贡献额: 200,
  满期率: 80,
  出险率: 20,
  案均赔款: 20,
  年计划达成率: 85
}

describe('KPIDashboard.vue', () => {
  it('renders tabs and metrics correctly', () => {
    const wrapper = mount(KPIDashboard, {
      props: {
        kpiData: mockKPIData
      },
      global: {
        stubs: {
          KPICard: {
            template: '<div class="kpi-card">{{ title }}: {{ value }}</div>',
            props: ['title', 'value']
          },
          'el-icon': true,
          'el-tooltip': true
        }
      }
    })

    // Check tabs
    expect(wrapper.text()).toContain('经营概览')
    expect(wrapper.text()).toContain('保费进度')
    expect(wrapper.text()).toContain('变动成本')

    // Check KPIs in Overview tab
    expect(wrapper.text()).toContain('保费时间进度达成率: 85')
    expect(wrapper.text()).toContain('变动成本率: 75')
    expect(wrapper.text()).toContain('满期赔付率: 50')
    expect(wrapper.text()).toContain('签单保费: 1000')
  })

  it('handles missing values gracefully', () => {
    const emptyKPI = {} as KPIResult
    const wrapper = mount(KPIDashboard, {
      props: {
        kpiData: emptyKPI
      },
      global: {
        stubs: {
          KPICard: {
            template: '<div class="kpi-card">{{ title }}: {{ value === undefined ? "undefined" : value }}</div>',
            props: ['title', 'value']
          },
          'el-icon': true,
          'el-tooltip': true
        }
      }
    })

    expect(wrapper.text()).toContain('保费时间进度达成率: undefined')
  })
})
