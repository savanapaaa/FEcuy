import Swal from 'sweetalert2'

// Utility function to handle z-index conflicts with dialogs
const ensureSweetAlertOnTop = () => {
  // Disable pointer events on all radix portals
  const radixPortals = document.querySelectorAll('[data-radix-portal]')
  radixPortals.forEach(portal => {
    (portal as HTMLElement).style.pointerEvents = 'none'
  })

  // Ensure SweetAlert container has maximum z-index
  const container = Swal.getContainer()
  if (container) {
    container.style.zIndex = '2147483647'
    container.style.position = 'fixed'
    container.style.pointerEvents = 'auto'
  }
  
  const popup = Swal.getPopup()
  if (popup) {
    popup.style.zIndex = '2147483647'
    popup.style.pointerEvents = 'auto'
  }

  // Force all SweetAlert elements to be on top
  const allSwalElements = document.querySelectorAll('[class*="swal2"]')
  allSwalElements.forEach(el => {
    const element = el as HTMLElement
    element.style.zIndex = '2147483647'
    element.style.pointerEvents = 'auto'
  })
}

const restoreDialogPointerEvents = () => {
  // Re-enable pointer events on radix portals
  const radixPortals = document.querySelectorAll('[data-radix-portal]')
  radixPortals.forEach(portal => {
    (portal as HTMLElement).style.pointerEvents = 'auto'
  })
}

// Debug function to check z-index conflicts
export const debugZIndex = () => {
  console.log('=== Z-Index Debug ===')
  
  // Check SweetAlert elements
  const swalContainer = document.querySelector('.swal2-container')
  const swalPopup = document.querySelector('.swal2-popup')
  
  if (swalContainer) {
    console.log('SweetAlert Container z-index:', window.getComputedStyle(swalContainer).zIndex)
  }
  
  if (swalPopup) {
    console.log('SweetAlert Popup z-index:', window.getComputedStyle(swalPopup).zIndex)
  }
  
  // Check Radix portals
  const radixPortals = document.querySelectorAll('[data-radix-portal]')
  radixPortals.forEach((portal, index) => {
    console.log(`Radix Portal ${index} z-index:`, window.getComputedStyle(portal).zIndex)
    console.log(`Radix Portal ${index} pointer-events:`, window.getComputedStyle(portal).pointerEvents)
  })
  
  // Check Dialog elements
  const dialogs = document.querySelectorAll('[role="dialog"]')
  dialogs.forEach((dialog, index) => {
    console.log(`Dialog ${index} z-index:`, window.getComputedStyle(dialog).zIndex)
  })
  
  console.log('==================')
}

// Add to window for debugging
if (typeof window !== 'undefined') {
  (window as any).debugZIndex = debugZIndex
}

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

// SweetAlert untuk dokumen berhasil di review
export const showDocumentReviewedSuccessAlert = async (documentTitle: string, totalItems: number, approvedItems: number, rejectedItems: number) => {
  // If all items are rejected, show special alert
  if (approvedItems === 0 && rejectedItems > 0) {
    return await showAllRejectedAlert(documentTitle, rejectedItems)
  }

  // Otherwise show normal success alert
  return await Swal.fire({
    title: 'Dokumen Berhasil Direview!',
    html: `
      <div class="text-center">
        <div class="mb-4">
          <div class="flex items-center justify-center mb-3">
            <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
          <div class="text-base font-semibold text-gray-800 mb-2">${documentTitle}</div>
          <div class="text-sm text-gray-600 mb-4">telah selesai direview</div>
          
          <div class="bg-gray-50 rounded-lg p-4 mb-4">
            <div class="text-xs text-gray-500 mb-2">Ringkasan Review:</div>
            <div class="flex justify-center space-x-4">
              <div class="text-center">
                <div class="text-lg font-bold text-blue-600">${totalItems}</div>
                <div class="text-xs text-gray-600">Total Konten</div>
              </div>
              <div class="text-center">
                <div class="text-lg font-bold text-green-600">${approvedItems}</div>
                <div class="text-xs text-gray-600">Disetujui</div>
              </div>
              ${rejectedItems > 0 ? `
                <div class="text-center">
                  <div class="text-lg font-bold text-red-600">${rejectedItems}</div>
                  <div class="text-xs text-gray-600">Ditolak</div>
                </div>
              ` : ''}
            </div>
          </div>
          
          <div class="text-xs ${approvedItems > 0 ? 'text-green-600' : 'text-orange-600'}">
            ${approvedItems > 0 ? 
              `✅ ${approvedItems} konten disetujui akan lanjut ke tahap validasi` : 
              '⚠️ Tidak ada konten yang disetujui dari review ini'
            }
          </div>
        </div>
      </div>
    `,
    icon: 'success',
    confirmButtonText: 'Tutup',
    confirmButtonColor: '#2563eb',
    allowOutsideClick: false,
    allowEscapeKey: false,
    customClass: {
      popup: 'swal2-mobile-popup',
      container: 'swal2-mobile-container',
      title: 'swal2-mobile-title',
      confirmButton: 'swal2-mobile-button-single',
      htmlContainer: 'swal2-mobile-text'
    },
    width: '90vw',
    padding: '1.5rem',
    didOpen: () => {
      ensureSweetAlertOnTop()
    },
    willClose: () => {
      restoreDialogPointerEvents()
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
          <div class="flex justify-center space-x-3">
            <div class="text-center p-3 bg-green-50 rounded-lg flex-1 max-w-[120px]">
              <div class="text-xl font-bold text-green-600">${approvedCount}</div>
              <div class="text-xs text-gray-600">Disetujui</div>
            </div>
            <div class="text-center p-3 bg-red-50 rounded-lg flex-1 max-w-[120px]">
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
    allowOutsideClick: false,
    allowEscapeKey: false,
    customClass: {
      popup: 'swal2-mobile-popup',
      container: 'swal2-mobile-container',
      title: 'swal2-mobile-title',
      confirmButton: 'swal2-mobile-button-single'
    },
    width: '90vw',
    padding: '1.5rem',
    didOpen: () => {
      ensureSweetAlertOnTop()
    },
    willClose: () => {
      restoreDialogPointerEvents()
    }
  })
}

// SweetAlert simple untuk dokumen berhasil di review (versi mobile)
export const showSimpleDocumentReviewedAlert = async (documentTitle: string) => {
  return await Swal.fire({
    title: 'Review Selesai!',
    html: `
      <div class="text-center">
        <div class="mb-4">
          <div class="flex items-center justify-center mb-3">
            <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
          </div>
          <div class="text-sm font-medium text-gray-800 mb-2">${documentTitle}</div>
          <div class="text-xs text-gray-600">berhasil direview dan disimpan</div>
        </div>
      </div>
    `,
    icon: 'success',
    confirmButtonText: 'OK',
    confirmButtonColor: '#2563eb',
    allowOutsideClick: false,
    allowEscapeKey: false,
    timer: 3000,
    timerProgressBar: true,
    customClass: {
      popup: 'swal2-mobile-popup',
      container: 'swal2-mobile-container',
      title: 'swal2-mobile-title',
      confirmButton: 'swal2-mobile-button-single',
      htmlContainer: 'swal2-mobile-text'
    },
    width: '90vw',
    padding: '1.5rem',
    didOpen: () => {
      ensureSweetAlertOnTop()
    },
    willClose: () => {
      restoreDialogPointerEvents()
    }
  })
}

// SweetAlert khusus untuk semua konten ditolak
export const showAllRejectedAlert = async (documentTitle: string, rejectedCount: number) => {
  return await Swal.fire({
    title: 'Semua Konten Ditolak',
    html: `
      <div class="text-center">
        <div class="mb-4">
          <div class="flex items-center justify-center mb-3">
            <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
          <div class="text-base font-semibold text-gray-800 mb-2">${documentTitle}</div>
          <div class="text-sm text-gray-600 mb-4">
            Semua <strong>${rejectedCount} konten</strong> dalam dokumen ini ditolak
          </div>
          
          <div class="bg-red-50 rounded-lg p-3 mb-4">
            <div class="text-xs text-red-700 font-medium">⚠️ Tindakan Selanjutnya:</div>
            <div class="text-xs text-red-600 mt-1">
              • Dokumen akan dikembalikan ke pengaju<br>
              • Perlu perbaikan sesuai alasan penolakan<br>
              • Dapat diajukan ulang setelah diperbaiki
            </div>
          </div>
        </div>
      </div>
    `,
    icon: 'warning',
    confirmButtonText: 'Selesai',
    confirmButtonColor: '#dc2626',
    allowOutsideClick: false,
    allowEscapeKey: false,
    customClass: {
      popup: 'swal2-mobile-popup',
      container: 'swal2-mobile-container',
      title: 'swal2-mobile-title',
      confirmButton: 'swal2-mobile-button-single',
      htmlContainer: 'swal2-mobile-text'
    },
    width: '90vw',
    padding: '1.5rem',
    didOpen: () => {
      ensureSweetAlertOnTop()
    },
    willClose: () => {
      restoreDialogPointerEvents()
    }
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
    allowOutsideClick: false,
    allowEscapeKey: false,
    customClass: {
      popup: 'swal2-mobile-popup',
      container: 'swal2-mobile-container',
      title: 'swal2-mobile-title',
      confirmButton: 'swal2-mobile-button-single',
      htmlContainer: 'swal2-mobile-text'
    },
    width: '90vw',
    padding: '1.5rem',
    didOpen: () => {
      ensureSweetAlertOnTop()
    },
    willClose: () => {
      restoreDialogPointerEvents()
    }
  })
}

// Mobile-specific confirmation alert
export const showMobileConfirmationAlert = async (title: string, text: string) => {
  return await Swal.fire({
    title: title,
    text: text,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Ya, Lanjutkan',
    cancelButtonText: 'Batal',
    confirmButtonColor: '#2563eb',
    cancelButtonColor: '#6b7280',
    reverseButtons: true,
    focusConfirm: false,
    allowOutsideClick: false,
    allowEscapeKey: true,
    heightAuto: false,
    position: 'center',
    customClass: {
      popup: 'swal2-mobile-popup',
      container: 'swal2-mobile-container',
      confirmButton: 'swal2-mobile-button swal2-confirm-mobile',
      cancelButton: 'swal2-mobile-button swal2-cancel-mobile',
      actions: 'swal2-mobile-actions',
      title: 'swal2-mobile-title',
      htmlContainer: 'swal2-mobile-text'
    },
    width: '90vw',
    padding: '1.5rem',
    backdrop: true,
    didOpen: () => {
      ensureSweetAlertOnTop()
    },
    willClose: () => {
      restoreDialogPointerEvents()
    }
  })
}

// Confirmation alert before action
export const showConfirmationAlert = async (title: string, text: string) => {
  // Use mobile-specific version for better compatibility
  return await showMobileConfirmationAlert(title, text)
}

// Konfirmasi sebelum menyimpan review
export const showSaveReviewConfirmation = async (totalItems: number, approvedItems: number, rejectedItems: number) => {
  return await Swal.fire({
    title: 'Konfirmasi Review',
    html: `
      <div class="text-center">
        <div class="mb-4">
          <div class="text-sm text-gray-700 mb-3">
            Anda akan menyimpan hasil review untuk <strong>${totalItems} konten</strong>:
          </div>
          
          <div class="bg-gray-50 rounded-lg p-3 mb-4">
            <div class="flex justify-center space-x-4 text-xs">
              <div class="text-center">
                <div class="font-bold text-green-600">${approvedItems}</div>
                <div class="text-gray-600">Disetujui</div>
              </div>
              <div class="text-center">
                <div class="font-bold text-red-600">${rejectedItems}</div>
                <div class="text-gray-600">Ditolak</div>
              </div>
            </div>
          </div>
          
          <div class="text-xs text-gray-600">
            ${approvedItems > 0 ? 
              '✓ Konten yang disetujui akan lanjut ke tahap validasi' : 
              '⚠️ Semua konten ditolak, dokumen akan dikembalikan'
            }
          </div>
        </div>
      </div>
    `,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Ya, Simpan Review',
    cancelButtonText: 'Batal',
    confirmButtonColor: '#2563eb',
    cancelButtonColor: '#6b7280',
    reverseButtons: true,
    allowOutsideClick: false,
    allowEscapeKey: false,
    customClass: {
      popup: 'swal2-mobile-popup',
      container: 'swal2-mobile-container',
      title: 'swal2-mobile-title',
      confirmButton: 'swal2-mobile-button-confirm',
      cancelButton: 'swal2-mobile-button-cancel',
      htmlContainer: 'swal2-mobile-text'
    },
    width: '90vw',
    padding: '1.5rem',
    didOpen: () => {
      ensureSweetAlertOnTop()
    },
    willClose: () => {
      restoreDialogPointerEvents()
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
      popup: 'swal2-mobile-popup',
      container: 'swal2-mobile-container',
      title: 'swal2-mobile-title',
      htmlContainer: 'swal2-mobile-text'
    },
    width: '90vw',
    padding: '1.5rem',
    didOpen: () => {
      ensureSweetAlertOnTop()
      Swal.showLoading()
    },
    willClose: () => {
      restoreDialogPointerEvents()
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
    customClass: {
      popup: 'swal2-mobile-toast',
    },
    didOpen: (toast) => {
      // Mobile-friendly z-index for toast
      if (toast) {
        toast.style.zIndex = '2147483647'
        toast.style.maxWidth = '90vw'
      }
      
      // Temporarily disable dialog pointer events for toast
      const radixPortals = document.querySelectorAll('[data-radix-portal]')
      radixPortals.forEach(portal => {
        (portal as HTMLElement).style.pointerEvents = 'none'
      })
      
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
    },
    willClose: () => {
      restoreDialogPointerEvents()
    }
  })

  Toast.fire({
    icon: type,
    title: title
  })
}

// Confirmation alert for unsaved form data
export const showUnsavedFormAlert = async () => {
  return await Swal.fire({
    title: 'Keluar dari Form?',
    html: `
      <div class="text-center">
        <div class="mb-4">
          <div class="text-lg text-gray-700">
            Data yang sudah Anda isi akan hilang jika keluar dari halaman ini.
          </div>
        </div>
        <div class="text-sm text-gray-600">
          Apakah Anda yakin ingin keluar?
        </div>
      </div>
    `,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Ya, Keluar',
    cancelButtonText: 'Tetap di Sini',
    confirmButtonColor: '#dc2626',
    cancelButtonColor: '#2563eb',
    reverseButtons: true,
    allowOutsideClick: false,
    allowEscapeKey: false,
    customClass: {
      popup: 'swal2-mobile-popup',
      container: 'swal2-mobile-container',
      title: 'swal2-mobile-title',
      confirmButton: 'swal2-mobile-button-confirm',
      cancelButton: 'swal2-mobile-button-cancel',
      htmlContainer: 'swal2-mobile-text'
    },
    width: '90vw',
    padding: '1.5rem',
    didOpen: () => {
      ensureSweetAlertOnTop()
    },
    willClose: () => {
      restoreDialogPointerEvents()
    }
  })
}
