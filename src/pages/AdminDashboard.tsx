import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { DownloadSimple } from '@phosphor-icons/react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks'
import { Container, Header } from '@/components/layout'
import { Loading } from '@/components/common'

const ADMIN_EMAIL = 'kangbeen.ko@gm.gist.ac.kr'

interface UserProgress {
  id: string
  user_id: string
  email: string
  marketing_consent: boolean
  name: string | null
  current_day: number
  completed_days: number[]
  center_goal: string | null
  created_at: string
  updated_at: string
  selected?: boolean
}

export function AdminDashboard() {
  const navigate = useNavigate()
  const { user, isLoading: authLoading } = useAuth()
  const [users, setUsers] = useState<UserProgress[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasFetched, setHasFetched] = useState(false)
  const [selectAll, setSelectAll] = useState(false)

  // Check if user is admin
  const isAdmin = user?.email === ADMIN_EMAIL

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      navigate('/', { replace: true })
      return
    }

    if (!isAdmin) {
      navigate('/dashboard', { replace: true })
      return
    }

    if (hasFetched) return

    const fetchData = async () => {
      setIsLoading(true)
      try {
        const { data: mandalas, error: mandalasError } = await supabase
          .from('mandalas')
          .select('*')
          .order('created_at', { ascending: false })

        if (mandalasError) throw mandalasError

        const usersData: UserProgress[] = (mandalas || []).map((m: any) => ({
          id: m.id,
          user_id: m.user_id,
          email: m.user_email || m.user_id.substring(0, 8) + '...',
          marketing_consent: m.marketing_consent || false,
          name: m.name || null,
          current_day: m.current_day || 1,
          completed_days: m.completed_days || [],
          center_goal: m.center_goal,
          created_at: m.created_at,
          updated_at: m.updated_at,
          selected: false,
        }))

        setUsers(usersData)
        setHasFetched(true)
      } catch (err) {
        console.error('Error fetching users:', err)
        setError(err instanceof Error ? err.message : '데이터를 불러오는데 실패했습니다.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [authLoading, user, isAdmin, hasFetched, navigate])

  const fetchUsers = async () => {
    setIsLoading(true)
    setError(null)
    setHasFetched(false)
    try {
      const { data: mandalas, error: mandalasError } = await supabase
        .from('mandalas')
        .select('*')
        .order('created_at', { ascending: false })

      if (mandalasError) throw mandalasError

      const usersData: UserProgress[] = (mandalas || []).map((m: any) => ({
        id: m.id,
        user_id: m.user_id,
        email: m.user_email || m.user_id.substring(0, 8) + '...',
        marketing_consent: m.marketing_consent || false,
        name: m.name || null,
        current_day: m.current_day || 1,
        completed_days: m.completed_days || [],
        center_goal: m.center_goal,
        created_at: m.created_at,
        updated_at: m.updated_at,
        selected: false,
      }))

      setUsers(usersData)
      setHasFetched(true)
    } catch (err) {
      console.error('Error fetching users:', err)
      setError(err instanceof Error ? err.message : '데이터를 불러오는데 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectAll = () => {
    const newSelectAll = !selectAll
    setSelectAll(newSelectAll)
    setUsers(users.map(u => ({ ...u, selected: newSelectAll })))
  }

  const handleSelectUser = (id: string) => {
    setUsers(users.map(u => 
      u.id === id ? { ...u, selected: !u.selected } : u
    ))
  }

  const selectedUsers = users.filter(u => u.selected)

  const downloadCSV = () => {
    if (selectedUsers.length === 0) {
      alert('다운로드할 사용자를 선택해주세요.')
      return
    }

    // Create CSV content
    const headers = ['이름', '이메일', '마케팅 동의', '현재 단계', '핵심 목표', '가입일', '최근 활동']
    const rows = selectedUsers.map(u => [
      u.name || '-',
      u.email || '-',
      u.marketing_consent ? 'O' : 'X',
      `단계 ${u.current_day}`,
      u.center_goal || '-',
      new Date(u.created_at).toLocaleDateString('ko-KR'),
      new Date(u.updated_at).toLocaleDateString('ko-KR'),
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n')

    // Create and download file
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `mandala_users_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" message="관리자 데이터 로딩 중..." />
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  const getProgressColor = (currentDay: number) => {
    if (currentDay >= 14) return 'bg-green-500'
    if (currentDay >= 10) return 'bg-blue-500'
    if (currentDay >= 5) return 'bg-yellow-500'
    return 'bg-gray-400'
  }

  const getProgressPercent = (currentDay: number) => {
    return Math.round((currentDay / 14) * 100)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Container className="py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">관리자 대시보드</h1>
              <p className="text-gray-600 mt-1">전체 사용자 진행 현황</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={downloadCSV}
                disabled={selectedUsers.length === 0}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  selectedUsers.length > 0
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
              <DownloadSimple size={16} />
                CSV 다운로드 ({selectedUsers.length})
              </button>
              <button
                onClick={fetchUsers}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                새로고침
              </button>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-500">전체 사용자</p>
              <p className="text-3xl font-bold text-gray-900">{users.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-500">완료 (단계 14)</p>
              <p className="text-3xl font-bold text-green-600">
                {users.filter(u => u.current_day >= 14).length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-500">진행 중</p>
              <p className="text-3xl font-bold text-blue-600">
                {users.filter(u => u.current_day > 1 && u.current_day < 14).length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-500">시작 전 (단계 1)</p>
              <p className="text-3xl font-bold text-gray-500">
                {users.filter(u => u.current_day === 1).length}
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              {error}
            </div>
          )}

          {/* Users Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    이름
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    이메일
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    마케팅
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    현재 단계
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    진행률
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    핵심 목표
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    가입일
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((userProgress) => (
                  <tr 
                    key={userProgress.id} 
                    className={`hover:bg-gray-50 ${userProgress.selected ? 'bg-primary-50' : ''}`}
                  >
                    <td className="px-4 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={userProgress.selected || false}
                        onChange={() => handleSelectUser(userProgress.id)}
                        className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {userProgress.name || '-'}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {userProgress.email}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        userProgress.marketing_consent 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {userProgress.marketing_consent ? 'O' : 'X'}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        userProgress.current_day >= 14 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        단계 {userProgress.current_day}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getProgressColor(userProgress.current_day)}`}
                            style={{ width: `${getProgressPercent(userProgress.current_day)}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">
                          {getProgressPercent(userProgress.current_day)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-900 max-w-[150px] truncate">
                        {userProgress.center_goal || '-'}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(userProgress.created_at).toLocaleDateString('ko-KR')}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      등록된 사용자가 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Container>
    </div>
  )
}
