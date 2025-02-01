import { create } from 'zustand'

const useStore = create((set) => ({
  count: 0,
  dashboard_server: (state) => set({count:state.count+1}),
    dashboard_client: (state) => set({count:state.count-1}),
    ip: '',
    setIp: (newIp) => set({ip: newIp}),
}))

export default useStore;