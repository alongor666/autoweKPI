import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ReportHeader from '../report/ReportHeader.vue'
import { useDataStore } from '@/stores/data'

// Mock ReportSummary data
const mockReportSummary = {
  isSingleOrgMode: true,
  organizationName: '测试分公司',
  summary: {
    签单保费: 1000,
    满期保费: 800
  },
  weekNumber: 42,
  year: 2025,
  dataDate: '2025-10-18',
  totalRows: 100,
  generatedAt: '2025-10-19T10:00:00.000Z'
}

// Mock the store module
vi.mock('@/stores/data', () => ({
  useDataStore: vi.fn()
}))

describe('ReportHeader.vue', () => {
  it('renders nothing when reportSummary is null', () => {
    (useDataStore as any).mockReturnValue({
      reportSummary: null
    })
    const wrapper = mount(ReportHeader)
    expect(wrapper.text()).toBe('')
  })

  it('renders header content when data is available', () => {
    (useDataStore as any).mockReturnValue({
      reportSummary: mockReportSummary
    })
    const wrapper = mount(ReportHeader)

    expect(wrapper.text()).toContain('测试分公司车险第42周经营分析')
    expect(wrapper.text()).toContain('数据截止日期：2025-10-18')
  })
})
