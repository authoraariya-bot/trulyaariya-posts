# 31 Oct score: a cosy felt piano; a phone ping; a soft blanket swish; a low uneasy pulse for the guilt;
# a cracking shimmer; a bright bloom of bells and an open chord as the wings unfold.
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))
from q_score import QScore, N, at
END, WIPE, CARD = 450, 360, 378
NOTIF, REPLY, WRAP0, GUILT, CRACK, BURST, WINGS = 10, 42, 92, 136, 214, 252, 258
S = QScore(END / 30, seed=3110)
for k, m in enumerate([64, 67, 71, 67, 64, 67]): S.felt(N(m), at(2 + k * 14), 0.03, 2.6)
S.bell(NOTIF, 88, 0.03); S.bell(NOTIF + 3, 91, 0.025)
S.felt(N(71), at(REPLY), 0.035, 2); S.felt(N(76), at(REPLY + 6), 0.03, 2)
S.noise(at(WRAP0), 0.9, 0.03, 0.06, 1.5)
for k in range(5): S.felt(N(52), at(GUILT + k * 16), 0.04, 1.2); S.felt(N(55), at(GUILT + 8 + k * 16), 0.03, 1.2)
S.sweep(at(CRACK), at(BURST) - at(CRACK), 400, 1600, 0.025); S.riser(at(CRACK + 10), at(BURST) - at(CRACK + 10), 0.04)
S.kick(at(BURST), 0.2); S.chime(WINGS, 0.06); S.arp(WINGS + 8, [76, 80, 83, 88, 92], 0.1, 0.035, 2.6)
S.bed([[64, 68, 71, 76], [61, 64, 68, 73], [57, 61, 64, 69], [59, 63, 66, 71]], at(WINGS), at(WIPE) + 0.6, bar=2.2, amp=0.032)
S.end_card(CARD, root=64)
S.write(os.path.join(os.path.dirname(__file__), "..", "..", "public", "q1031.wav")); print("ok")
