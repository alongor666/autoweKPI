import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import KPICard from '../common/KPICard.vue'

describe('KPICard.vue', () => {
  it('renders title and value correctly', () => {
    const wrapper = mount(KPICard, {
      props: {
        title: '测试指标',
        value: 1234.56,
        unit: '万元'
      },
      global: {
        stubs: {
          'el-statistic': {
            template: `
              <div class="el-statistic">
                <div class="title"><slot name="title"></slot></div>
                <div class="content">{{ value }}</div>
                <div class="suffix"><slot name="suffix"></slot></div>
              </div>
            `,
            props: ['value', 'precision']
          },
          'el-icon': true,
          'el-tooltip': true,
          'info-filled': true
        }
      }
    })

    expect(wrapper.text()).toContain('测试指标')
    expect(wrapper.text()).toContain('万元')
  })

  it('renders tooltip when description is provided', () => {
    const wrapper = mount(KPICard, {
      props: {
        title: '测试指标',
        value: 100,
        description: '这是一个说明'
      },
      global: {
        stubs: {
          'el-statistic': true,
          'el-icon': { template: '<div class="info-icon"></div>' },
          'el-tooltip': {
            template: '<div class="el-tooltip"><slot></slot></div>',
            props: ['content']
          },
          'info-filled': true,
          InfoFilled: true
        }
      }
    })

    expect(wrapper.find('.info-icon').exists()).toBe(true)
  })
})
