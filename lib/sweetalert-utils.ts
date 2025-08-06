import Swal from 'sweetalert2'

// Success SweetAlert for review completion
export const showReviewSuccessAlert = async (approvedCount: number, rejectedCount: number) => {
  return await Swal.fire({
    title: 'Review Berhasil!',
    html: `
      <div class="text-center">
        <div class="mb-4">
          <div class="text-lg font-semibold text-gray-800 mb-2">Hasil Review:</div>
          <div class="flex justify-center space-x-6">
            <div class="text-center">
              <div class="text-2xl font-bold text-green-600">${approvedCount}</div>
              <div class="text-sm text-gray-600">Disetujui</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-red-600">${rejectedCount}</div>
              <div class="text-sm text-gray-600">Ditolak</div>
            </div>
          </div>
        </div>
      </div>
    `,
    icon: 'success',
    confirmButtonText: 'OK',
    confirmButtonColor: '#2563eb',
    customClass: {
      popup: 'rounded-lg',
      title: 'text-xl font-bold text-gray-800',
      confirmButton: 'px-6 py-2 rounded-md font-medium'
    }
  })
}

// Mobile version of success alert
export const showMobileReviewSuccessAlert = async (approvedCount: number, rejectedCount: number) => {
  return await Swal.fire({
    title: 'Review Berhasil!',
    html: `
      <div class="text-center">
        <div class="mb-4">
          <div class="text-base font-semibold text-gray-800 mb-3">Hasil Review:</div>
          <div class="flex justify-center space-x-4">
            <div class="text-center p-3 bg-green-50 rounded-lg">
              <div class="text-xl font-bold text-green-600">${approvedCount}</div>
              <div class="text-xs text-gray-600">Disetujui</div>
            </div>
            <div class="text-center p-3 bg-red-50 rounded-lg">
              <div class="text-xl font-bold text-red-600">${rejectedCount}</div>
              <div class="text-xs text-gray-600">Ditolak</div>
            </div>
          </div>
        </div>
      </div>
    `,
    icon: 'success',
    confirmButtonText: 'OK',
    confirmButtonColor: '#2563eb',
    customClass: {
      popup: 'rounded-lg text-sm',
      title: 'text-lg font-bold text-gray-800',
      confirmButton: 'px-4 py-2 rounded-md font-medium text-sm'
    },
    width: 320
  })
}

// Error alert
export const showErrorAlert = async (message: string = 'Terjadi kesalahan. Silakan coba lagi.') => {
  return await Swal.fire({
    title: 'Terjadi Kesalahan',
    text: message,
    icon: 'error',
    confirmButtonText: 'OK',
    confirmButtonColor: '#dc2626',
    customClass: {
      popup: 'rounded-lg'
    }
  })
}

// Confirmation alert before action
export const showConfirmationAlert = async (title: string, text: string) => {
  return await Swal.fire({
    title: title,
    text: text,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Ya, Lanjutkan',
    cancelButtonText: 'Batal',
    confirmButtonColor: '#2563eb',
    cancelButtonColor: '#6b7280',
    customClass: {
      popup: 'rounded-lg'
    }
  })
}

// Loading alert
export const showLoadingAlert = (title: string = 'Memproses...', text: string = 'Mohon tunggu sebentar') => {
  Swal.fire({
    title: title,
    text: text,
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    customClass: {
      popup: 'rounded-lg'
    },
    didOpen: () => {
      Swal.showLoading()
    }
  })
}

// Close loading alert
export const closeLoadingAlert = () => {
  Swal.close()
}

// Custom toast-like alert
export const showToastAlert = (title: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
  })

  Toast.fire({
    icon: type,
    title: title
  })
}
