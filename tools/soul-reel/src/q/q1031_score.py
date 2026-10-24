# 31 Oct score: rain on the window and a warm felt-piano bed in E; card slides as paper swishes, a stamp thud,
# a low minor sigh as the guilt cloud gathers; rain drops plink into the pot; a rising arpeggio as the sprout blooms.
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))
from q_score import QScore, N, at
END, WIPE, CARD = 420, 330, 348
CARDS, STAMP, AWAY, CLOUD, RAIN, SPROUT, BLOOM, KEY = 10, 58, 74, 96, 160, 186, 236, 262
S = QScore(END / 30, seed=31)
for k in range(int(at(BLOOM) / 1.0)): S.noise(k * 1.0, 1.4, 0.022, 0.25, 1)
S.bed([[64, 68, 71, 75], [61, 64, 68, 71], [57, 61, 64, 68], [59, 63, 66, 71]], 0.1, at(WIPE) + 0.6, bar=2.8, amp=0.03)
S.noise(at(CARDS), 0.3, 0.04, 0.2, 2); S.noise(at(CARDS + 4), 0.3, 0.04, 0.2, 2)
S.kick(at(STAMP), 0.3); S.snap(at(STAMP), 0.06); S.noise(at(AWAY), 0.6, 0.04, 0.05, 1.5)
S.felt(N(52), at(CLOUD), 0.06, 3); S.felt(N(55), at(CLOUD + 6), 0.04, 3)
for i in range(10): S.bell(RAIN + 4 + i * 2.6, [83, 86, 88][i % 3], 0.016)
S.arp(SPROUT + 10, [64, 68, 71, 76, 80], 0.14, 0.04, 2.6)
S.chime(BLOOM + 2, 0.045)
for i, m in enumerate([76, 80, 83, 88]): S.bell(KEY + 6 + i * 4, m, 0.026)
S.end_card(CARD, root=64)
S.write(os.path.join(os.path.dirname(__file__), "..", "..", "public", "q1031.wav")); print("ok")
