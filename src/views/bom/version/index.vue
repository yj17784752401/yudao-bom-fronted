<template>
  <div class="bom-version-container">
    <!-- 设备选择区域 -->
    <ContentWrap>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="选择设备">
            <el-select
              v-model="selectedDeviceId"
              filterable
              placeholder="请选择设备"
              @change="handleDeviceChange"
              style="width: 100%"
            >
              <el-option label="全部设备" :value="0" />
              <el-option
                v-for="device in deviceList"
                :key="device.id"
                :label="`${device.code} - ${device.name}`"
                :value="device.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-button
            type="primary"
            @click="openCreateDialog"
            :disabled="!selectedDeviceId || selectedDeviceId === 0"
          >
            创建新版本
          </el-button>
        </el-col>
      </el-row>
    </ContentWrap>

    <!-- BOM 版本列表 -->
    <ContentWrap title="BOM 版本列表">
      <el-table :data="versionList" border stripe v-loading="loading">
        <el-table-column
          v-if="selectedDeviceId === 0"
          prop="deviceName"
          label="设备名称"
          width="150"
        />
        <el-table-column prop="version" label="版本号" width="100" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="bomCategory" label="分类" width="100" />
        <el-table-column label="基础信息" min-width="150">
          <template #default="{ row }">
            {{ parseBaseInfo(row.baseInfo) }}
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="showRecommend(row)">查看推荐</el-button>
          </template>
        </el-table-column>
      </el-table>
    </ContentWrap>

    <!-- 创建新版本对话框 -->
    <Dialog v-model="createDialogVisible" title="创建 BOM 版本" width="800px">
      <el-form ref="createFormRef" :model="createForm" :rules="createRules" label-width="100px">
        <el-form-item label="设备ID">
          <el-input v-model="createForm.deviceId" disabled />
        </el-form-item>
        <el-form-item label="BOM分类" prop="bomCategory">
          <el-select v-model="createForm.bomCategory" placeholder="请选择分类">
            <el-option label="机械" value="机械" />
            <el-option label="电气" value="电气" />
            <el-option label="软件" value="软件" />
          </el-select>
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input v-model="createForm.name" placeholder="BOM名称" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="createForm.description" type="textarea" />
        </el-form-item>
        <el-form-item label="技术参数">
          <div class="tech-params">
            <div v-for="(item, index) in createForm.technicalParams" :key="index" class="param-row">
              <el-input v-model="item.key" placeholder="参数名" style="width: 150px" />
              <el-input
                v-model="item.value"
                placeholder="参数值"
                style="width: 150px; margin: 0 8px"
              />
              <el-input v-model="item.unit" placeholder="单位" style="width: 80px" />
              <el-button link type="danger" @click="removeTechParam(index)">删除</el-button>
            </div>
            <el-button type="primary" link @click="addTechParam">+ 添加参数</el-button>
          </div>
        </el-form-item>
        <el-form-item label="可换备件">
          <div class="substitute-parts">
            <div v-for="(item, index) in createForm.substituteParts" :key="index" class="part-row">
              <el-input-number
                v-model="item.sparePartId"
                placeholder="备件ID"
                :min="1"
                controls-position="right"
              />
              <el-input-number
                v-model="item.priority"
                placeholder="优先级"
                :min="1"
                controls-position="right"
                style="margin: 0 8px"
              />
              <el-select v-model="item.substituteType" placeholder="替代类型" style="width: 120px">
                <el-option label="直接替代" value="直接替代" />
                <el-option label="兼容替代" value="兼容替代" />
              </el-select>
              <el-button link type="danger" @click="removeSubstitutePart(index)">删除</el-button>
            </div>
            <el-button type="primary" link @click="addSubstitutePart">+ 添加备件</el-button>
          </div>
        </el-form-item>
        <el-form-item label="保养标准">
          <div class="maintenance-standards">
            <div
              v-for="(item, index) in createForm.maintenanceStandards"
              :key="index"
              class="standard-row"
            >
              <el-input v-model="item.standardName" placeholder="标准名称" style="width: 150px" />
              <el-select
                v-model="item.cycleType"
                placeholder="周期类型"
                style="width: 100px; margin: 0 8px"
              >
                <el-option label="每日" value="每日" />
                <el-option label="每周" value="每周" />
                <el-option label="每月" value="每月" />
                <el-option label="每季" value="每季" />
                <el-option label="每年" value="每年" />
              </el-select>
              <el-input-number
                v-model="item.cycleValue"
                :min="1"
                placeholder="值"
                controls-position="right"
              />
              <el-input
                v-model="item.executorRole"
                placeholder="执行角色"
                style="width: 100px; margin: 0 8px"
              />
              <el-select v-model="item.standardType" placeholder="类型" style="width: 100px">
                <el-option label="保养" value="保养" />
                <el-option label="点检" value="点检" />
                <el-option label="巡检" value="巡检" />
              </el-select>
              <el-button link type="danger" @click="removeMaintenanceStandard(index)"
                >删除</el-button
              >
            </div>
            <el-button type="primary" link @click="addMaintenanceStandard">+ 添加标准</el-button>
          </div>
        </el-form-item>
        <el-form-item label="文档附件ID" prop="documentIds">
          <el-input
            v-model="createForm.documentIdsStr"
            placeholder="多个ID用逗号分隔，如 3001,3002"
          />
        </el-form-item>
        <el-form-item label="直接发布" prop="publish">
          <el-switch v-model="createForm.publish" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="creating" @click="handleCreate">确定</el-button>
      </template>
    </Dialog>

    <!-- 推荐信息对话框 -->
    <Dialog
      v-model="recommendDialogVisible"
      title="可换备件与保养标准"
      width="700px"
      :footer="false"
    >
      <el-tabs v-model="recommendTab">
        <el-tab-pane label="可换备件" name="parts">
          <el-table :data="recommendData.substituteParts" border>
            <el-table-column prop="sparePartName" label="备件名称" />
            <el-table-column prop="priority" label="优先级" width="80" />
            <el-table-column prop="currentInventory" label="当前库存" width="100" />
            <el-table-column prop="substituteType" label="替代类型" width="100" />
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="保养标准" name="standards">
          <el-table :data="recommendData.maintenanceStandards" border>
            <el-table-column prop="standardName" label="标准名称" />
            <el-table-column prop="cycleType" label="周期类型" width="100" />
            <el-table-column prop="cycleValue" label="周期值" width="80" />
            <el-table-column prop="executorRole" label="执行角色" width="100" />
            <el-table-column prop="standardType" label="类型" width="80" />
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getBomRecommend, createBomVersion, getBomVersions, getDeviceList } from '@/api/bom/version'

// ========== 设备选择 ==========
const selectedDeviceId = ref<number>(0) // 默认选择“全部”
const deviceList = ref<any[]>([])

// 获取设备列表（真实接口）
const fetchDeviceList = async () => {
  try {
    const res = await getDeviceList()
    deviceList.value = res || []
  } catch (error) {
    ElMessage.error('获取设备列表失败')
  }
}

// ========== BOM版本列表 ==========
const versionList = ref<any[]>([])
const loading = ref(false)

// 根据所选设备加载版本列表
const handleDeviceChange = async () => {
  try {
    loading.value = true
    if (selectedDeviceId.value === 0) {
      // 查询全部
      const res = await getBomVersions()
      versionList.value = res || []
      console.log('版本列表响应:', res)
    } else {
      const res = await getBomVersions(selectedDeviceId.value)
      versionList.value = res || []
      console.log('版本列表响应:', res)
    }
  } catch (error) {
    ElMessage.error('获取版本列表失败')
  } finally {
    loading.value = false
  }
}

// ========== 创建新版本 ==========
const createDialogVisible = ref(false)
const creating = ref(false)
const createFormRef = ref()
const createForm = reactive({
  deviceId: undefined as number | undefined,
  bomCategory: '',
  name: '',
  description: '',
  technicalParams: [] as { key: string; value: string; unit: string }[],
  substituteParts: [] as { sparePartId: number; priority: number; substituteType: string }[],
  maintenanceStandards: [] as {
    standardName: string
    cycleType: string
    cycleValue: number
    executorRole: string
    standardType: string
  }[],
  documentIdsStr: '',
  publish: false
})

const createRules = {
  bomCategory: [{ required: true, message: '请选择BOM分类', trigger: 'change' }],
  name: [{ required: true, message: '请输入BOM名称', trigger: 'blur' }]
}

const openCreateDialog = () => {
  createForm.deviceId = selectedDeviceId.value === 0 ? undefined : selectedDeviceId.value
  createForm.bomCategory = ''
  createForm.name = ''
  createForm.description = ''
  createForm.technicalParams = []
  createForm.substituteParts = []
  createForm.maintenanceStandards = []
  createForm.documentIdsStr = ''
  createForm.publish = false
  createDialogVisible.value = true
}

// 动态表单项操作方法
const addTechParam = () => createForm.technicalParams.push({ key: '', value: '', unit: '' })
const removeTechParam = (index: number) => createForm.technicalParams.splice(index, 1)
const addSubstitutePart = () =>
  createForm.substituteParts.push({ sparePartId: 0, priority: 1, substituteType: '直接替代' })
const removeSubstitutePart = (index: number) => createForm.substituteParts.splice(index, 1)
const addMaintenanceStandard = () =>
  createForm.maintenanceStandards.push({
    standardName: '',
    cycleType: '每日',
    cycleValue: 1,
    executorRole: '',
    standardType: '点检'
  })
const removeMaintenanceStandard = (index: number) =>
  createForm.maintenanceStandards.splice(index, 1)

const handleCreate = async () => {
  if (!createForm.deviceId) {
    ElMessage.warning('请先选择一个具体设备')
    return
  }

  const valid = await createFormRef.value?.validate().catch(() => false)
  if (!valid) return

  // 构建 baseInfo JSON
  const baseInfo = JSON.stringify({
    name: createForm.name,
    description: createForm.description
  })

  // 处理文档ID
  const documentIds = createForm.documentIdsStr
    ? createForm.documentIdsStr
        .split(',')
        .map((id) => Number(id.trim()))
        .filter((id) => !isNaN(id))
    : []

  // 备件优先级确保为数字
  const substituteParts = createForm.substituteParts.map((p) => ({
    ...p,
    sparePartId: Number(p.sparePartId)
  }))

  const reqData = {
    deviceId: createForm.deviceId,
    publish: createForm.publish,
    bomCategory: createForm.bomCategory,
    baseInfo,
    technicalParams: createForm.technicalParams,
    substituteParts,
    maintenanceStandards: createForm.maintenanceStandards,
    documentIds
  }

  try {
    creating.value = true
    await createBomVersion(reqData)
    ElMessage.success('创建成功')
    createDialogVisible.value = false
    // 刷新列表
    handleDeviceChange()
  } catch (error) {
    // 错误已在拦截器中处理
  } finally {
    creating.value = false
  }
}

// ========== 推荐信息 ==========
const recommendDialogVisible = ref(false)
const recommendTab = ref('parts')
const recommendData = ref({
  deviceId: null,
  deviceName: '',
  version: '',
  substituteParts: [],
  maintenanceStandards: []
})

const showRecommend = async (row: any) => {
  try {
    const res = await getBomRecommend(row.deviceId, row.version)
    recommendData.value = res
    recommendDialogVisible.value = true
  } catch (error) {
    ElMessage.error('获取推荐信息失败')
  }
}

// 解析 baseInfo 显示名称
const parseBaseInfo = (baseInfo: string) => {
  try {
    const obj = JSON.parse(baseInfo)
    return obj.name || '-'
  } catch {
    return baseInfo || '-'
  }
}

const statusTagType = (status: string) => {
  switch (status) {
    case '草稿':
      return 'info'
    case '已发布':
      return 'success'
    case '历史':
      return 'warning'
    default:
      return ''
  }
}

onMounted(() => {
  fetchDeviceList()
  handleDeviceChange() // 初始加载全部版本
})
</script>

<style scoped>
.tech-params,
.substitute-parts,
.maintenance-standards {
  width: 100%;
}
.param-row,
.part-row,
.standard-row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}
.param-row > *,
.part-row > *,
.standard-row > * {
  margin-right: 8px;
}
</style>
