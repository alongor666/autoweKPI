import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import FileUpload from '../common/FileUpload.vue'
import { useDataStore } from '@/stores/data'

// Mock Element Plus components
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus')
  return {
    ...actual,
    ElMessage: {
      success: vi.fn(),
      error: vi.fn()
    }
  }
})

describe('FileUpload.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders upload area correctly', () => {
    const wrapper = mount(FileUpload, {
      global: {
        stubs: {
          'el-upload': {
            template: '<div><slot></slot></div>',
            props: ['onChange']
          },
          'el-icon': true,
          'upload-filled': true,
          'el-result': true,
          'el-progress': true
        }
      }
    })

    expect(wrapper.text()).toContain('将 CSV 文件拖到此处，或 点击上传')
    // expect(wrapper.text()).toContain('只能上传 csv 文件')
  })

  it('shows loading overlay when store is loading', async () => {
    const wrapper = mount(FileUpload, {
      global: {
        stubs: {
          'el-upload': true,
          'el-icon': true,
          'upload-filled': true,
          'el-result': true,
          'el-progress': true
        }
      }
    })

    const dataStore = useDataStore()
    dataStore.loading = true
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.loading-overlay').exists()).toBe(true)
  })
})
