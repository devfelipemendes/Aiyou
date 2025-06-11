//
// *Exemplo de uso para o ECHO (Função que vai escutar o canal)
//  import { getEcho, registerReconnectListener } from '../echo';
// import { AppDispatch } from '../../store';

// export const listenChatEvents = (userId: string, dispatch: AppDispatch, token: string) => {
//   const echo = getEcho(token);

//   const setup = () => {
//     echo.private(`chat.${userId}`)
//       .listen('.mensagem.recebida', (event: any) => {
//         dispatch({
//           type: 'MENSAGEM/RECEBIDA',
//           payload: event.mensagem,
//         });
//       });
//   };

//   setup(); // Primeiro listen
//   registerReconnectListener(setup); // Registra pra reconexão
// };
