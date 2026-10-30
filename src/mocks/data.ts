import type { Notice, Schedule } from '../types'

export const initialNotices: Notice[] = [
  { id: '1', title: '9/18 정규세션 장소 변경 안내', date: '2026.09.08', author: '운영진 전은우', pinned: false, body: '안녕하세요, 학회원 여러분.\n\n9월 18일 정규 세션 장소가 변경되었습니다. 기존 공학관 302호에서 공학관 B101호로 변경되오니 착오 없으시길 바랍니다.\n\n일시: 2026년 9월 18일(금) 오후 7시\n장소: 공학관 B101호\n\n주차 공간이 협소하니 대중교통 이용을 권장합니다. 혹시 장소 관련 문의사항이 있으시면 운영진 단체 채팅방에 남겨주세요.\n\n많은 참여 부탁드립니다. 감사합니다.' },
  { id: '2', title: '11월 기후 환경 멘토링 참가 신청 마감 D-3', date: '2026.09.08', author: '운영진', pinned: false, body: '11월 기후 환경 멘토링 참여를 희망하는 학회원은 신청 기간 내 신청해 주세요.' },
  { id: '3', title: '대외협력부 워크스테이션 안내', date: '2026.09.08', author: '운영진', pinned: false, body: '대외협력부 워크스테이션 관련 세부 내용은 운영진에게 문의해 주세요.' },
  ...Array.from({ length: 6 }, (_, i) => ({ id: String(i + 4), title: '9/18 정규세션 장소 변경 안내', date: '2026.09.08', author: '운영진', pinned: false, body: '정규 세션 장소 안내를 확인해 주세요.' })),
]
export const initialSchedules: Schedule[] = [
  { id: '1', title: '정규 세션', date: '2026-09-18', time: '19:00', location: '이화여대 ECC' },
  { id: '2', title: '정규 세션', date: '2026-09-18', time: '19:00', location: '이화여대 ECC' },
]
