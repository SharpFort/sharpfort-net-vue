declare namespace Api {
  namespace Monitor {
    /** 服务器监控信息总览 */
    interface MonitorServerInfoDto {
      cpu?: CpuInfoDto
      memory?: MemoryInfoDto
      disks?: DiskInfoDto[]
      sys?: SysInfoDto
      app?: AppInfoDto
      networks?: NetworkAdapterDto[]
      assemblies?: AssemblyInfoDto[]
    }

    /** CPU信息 */
    interface CpuInfoDto {
      name?: string
      coreTotal?: number
      logicalProcessors?: number
      cpuRate?: number
      freeRate?: number
    }

    /** 内存信息 */
    interface MemoryInfoDto {
      totalRAM?: string
      usedRam?: string
      freeRam?: string
      ramRate?: string
    }

    /** 磁盘信息 */
    interface DiskInfoDto {
      diskName?: string
      typeName?: string
      totalSize?: number
      used?: number
      availableFreeSpace?: number
      availablePercent?: number
    }

    /** 主机系统信息 */
    interface SysInfoDto {
      computerName?: string
      osName?: string
      osArch?: string
      serverIP?: string
      runTime?: string
    }

    /** 运行环境(App)信息 */
    interface AppInfoDto {
      name?: string
      rootPath?: string
      webRootPath?: string
      version?: string
      appRAM?: string
      startTime?: string
      runTime?: string
      host?: string
    }

    /** 网卡信息 */
    interface NetworkAdapterDto {
      name?: string
      macAddress?: string
      iPv4?: string
    }

    /** 程序集依赖信息 */
    interface AssemblyInfoDto {
      name?: string
      version?: string
    }
  }
}
