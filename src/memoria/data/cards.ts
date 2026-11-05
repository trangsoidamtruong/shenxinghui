/* DỮ LIỆU THẺ – sửa file này để thêm/sửa thẻ
   id      : số thứ tự (hiện dạng 01, 02...)
   title   : tên thẻ (tiếng Việt)
   titleEn : tên thẻ (tiếng Anh – hiển thị dòng phụ bên dưới tên tiếng Việt)
   type    : "video" = thẻ 5★ (có video) | "image" = thẻ 4★ (chỉ ảnh)
   done    : true = đã có bản dịch (nút "Giải mã" bấm được) | false = chưa dịch
   img     : ảnh bìa (bắt buộc với thẻ ảnh; với thẻ video dùng làm poster)
   src     : file video (.webm/.mp4) – chỉ cho thẻ type:"video", để "" nếu chưa có
   desc    : 1 dòng mô tả
   url     : trang bản dịch sẽ mở khi bấm "Giải mã ký ức" */

export interface MemoriaCard {
  id: number;
  title: string;
  titleEn?: string;
  type: "video" | "image";
  done: boolean;
  img: string;
  src: string;
  desc: string;
  url: string;
}

declare global {
  interface Window {
    MEMORIA_CARDS?: MemoriaCard[];
  }
}

export const MEMORIA_CARDS: MemoriaCard[] = [
  {id:1, title:"Beachside Victory", titleEn:"Beachside Victory", type:"image", done:false, img:"/assets/aistudio/Beachside_Victory_e14d41ce.webp", src:"", desc:"Don't let the sunshine, the beach, and the perfect weather go to waste.", url:"/memoria/mem-01"},
  {id:2, title:"Firelit Embrace", titleEn:"Firelit Embrace", type:"image", done:false, img:"/assets/aistudio/Firelit_Embrace_63587b2d.webp", src:"", desc:"Because of one mission, I somehow ended up as Xavier's special \"hostage.\"", url:"/memoria/mem-02"},
  {id:3, title:"Horizon's Pulse", titleEn:"Horizon's Pulse", type:"image", done:false, img:"/assets/aistudio/Horizon_s_Pulse_6cc6cff8.webp", src:"", desc:"If Xavier and I were to live on another planet... what kind of story would unfold?", url:"/memoria/mem-03"},
  {id:4, title:"Moments Refined", titleEn:"Moments Refined", type:"image", done:true, img:"/assets/aistudio/Moments_Refined_2268befd.webp", src:"", desc:"When life falls apart, come upstairs and we'll piece it back together.", url:"/memoria/mem-04"},
  {id:5, title:"Nocturnal Hunt", titleEn:"Nocturnal Hunt", type:"image", done:false, img:"/assets/aistudio/Nocturnal_Hunt_86e343ca.webp", src:"", desc:"Xavier seems unusually \"unlucky\" lately...", url:"/memoria/mem-05"},
  {id:6, title:"Twofold Heartbeat", titleEn:"Twofold Heartbeat", type:"image", done:false, img:"/assets/aistudio/Twofold_Heartbeat_62fd6a9a.webp", src:"", desc:"With New Year approaching, Xavier and I received one last mission to complete before the holiday break.", url:"/memoria/mem-06"}
];

if (typeof window !== "undefined") {
  window.MEMORIA_CARDS = MEMORIA_CARDS;
}
