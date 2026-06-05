import request from '@/config/axios'

// 创建 BOM 版本
export const createBomVersion = async (data: any) => {
  return await request.post({
    url: '/api/v1/bom/versions',
    data
  })
}

// 获取推荐信息（可换备件 + 保养标准）
export const getBomRecommend = async (deviceId: number, version?: string) => {
  return await request.get({
    url: `/api/v1/bom/${deviceId}/recommend`,
    params: { version }
  })
}

// 获取设备 BOM 版本列表（deviceId 可选）
export const getBomVersions = async (deviceId?: number) => {
  return await request.get({
    url: '/api/v1/bom/versions',
    params: deviceId ? { deviceId } : {} // 不传deviceId则查询所有
  })
}

// 新增：获取设备列表
export const getDeviceList = async () => {
  return await request.get({
    url: '/api/v1/bom/devices'
  })
}
