# Chapter 03 teaching ladder (server) — log

Plan: [ch03-teaching-ladder-checklist.md](ch03-teaching-ladder-checklist.md)

How each stage was checked: the stage was copied out of git (`git archive`) into a scratch folder that
shares one `node_modules`, started on port **3210** with its own database **`mernskeleton_ladder`**
(so the real `mernskeleton` data and the servers on 3000/3100 were not touched), and a small `fetch`
script sent the stage's requests and compared status codes and bodies.

---
