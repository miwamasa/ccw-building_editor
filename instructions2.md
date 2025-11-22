既存の、「建物モデルワークベンチ」、生成センサー名と、物理センサー名のマッチングが、簡易アルゴリズムになっている、これを改良したい。

- 生成センサ名の名目規則をオントロジーに基づくものに変更
 - sensor_naming/sensor_naming_rules.md
 - sensor_naming/generate_sensor_names.py
- 新しい生成センサー名をつかったマッチングアルゴリズム
 - 正規表現版 sensor_matcher/sensor_matcher.py
 - AI API+プロンプト版 sensor_matcher/ai_matching_prompt_with_hierarchy.md

 AI API+プロンプト版は、プロンプトの一部が建物モデルの構成に依存するので、この部分はモデルに合わせて作って交換しなければならないことに注意。

 これらの資料をもとに、新しいマッチングを実装してほしい、正規表現版と、AI API+プロンプト版を切り替えらえるようにして