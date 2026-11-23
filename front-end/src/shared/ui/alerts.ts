import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'

export async function confirmarAcao(mensagem: string): Promise<boolean> {
  const resultado = await Swal.fire({
    title: mensagem,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Confirmar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#bd704c',
    cancelButtonColor: '#66736c',
    reverseButtons: true,
    focusCancel: true,
  })

  return resultado.isConfirmed
}
